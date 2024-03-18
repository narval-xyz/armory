import {
  Action,
  Decision,
  Engine,
  Entities,
  EvaluationRequest,
  EvaluationResponse,
  Policy
} from '@narval/policy-engine-shared'
import { HttpStatus } from '@nestjs/common'
import { loadPolicy } from '@open-policy-agent/opa-wasm'
import { resolve } from 'path'
import { v4 } from 'uuid'
import { z } from 'zod'
import { POLICY_ENTRYPOINT } from '../open-policy-agent.constant'
import { OpenPolicyAgentException } from './exception/open-policy-agent.exception'
import { resultSchema } from './schema/open-policy-agent.schema'
import { OpenPolicyAgentInstance, Result } from './type/open-policy-agent.type'
import { toData, toInput } from './util/evaluation.util'
import { build } from './util/wasm-build.util'

export class OpenPolicyAgentEngine implements Engine<OpenPolicyAgentEngine> {
  private policies: Policy[]

  private entities: Entities

  private opa?: OpenPolicyAgentInstance

  constructor(policies?: Policy[], entities?: Entities) {
    this.entities = entities || {
      addressBook: [],
      credentials: [],
      // TODO: (@wcalderipe, 18/03/24) set the data is mission critical to the
      // engine to work and it's not being tested. A possible way to test
      tokens: [],
      userGroupMembers: [],
      userGroups: [],
      userWallets: [],
      users: [],
      walletGroupMembers: [],
      walletGroups: [],
      wallets: []
    }

    this.policies = policies || []
  }

  setPolicies(policies: Policy[]): OpenPolicyAgentEngine {
    this.policies = policies

    return this
  }

  getPolicies(): Policy[] {
    return this.policies
  }

  getOpenPolicyAgentInstance(): OpenPolicyAgentInstance | undefined {
    return this.opa
  }

  setEntities(entities: Entities): OpenPolicyAgentEngine {
    this.entities = entities

    return this
  }

  getEntities(): Entities {
    return this.entities
  }

  async load(): Promise<OpenPolicyAgentEngine> {
    try {
      const wasm = await build({
        path: `/tmp/armory-policy-bundle-${v4()}`,
        regoCorePath: resolve(__dirname, '../core/rego'),
        policies: this.getPolicies()
      })

      this.opa = await loadPolicy(wasm, undefined, {
        'time.now_ns': () => new Date().getTime() * 1000000
      })

      this.opa.setData(toData(this.getEntities()))

      return this
    } catch (error) {
      throw new OpenPolicyAgentException({
        message: 'Fail to load Open Policy Agent engine',
        suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        origin: error
      })
    }
  }

  async evaluate(request: EvaluationRequest): Promise<EvaluationResponse> {
    const { action } = request.request

    if (action !== Action.SIGN_TRANSACTION) {
      throw new OpenPolicyAgentException({
        message: 'Open Policy Agent engine unsupported action',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { action }
      })
    }

    const results = await this.opaEvaluate(request)
    const decision = this.decide(results)

    return {
      decision: decision.decision,
      request: request.request,
      approvals: undefined
      //approvals: decision.totalApprovalsRequired?.length
      //  ? {
      //      required: decision.totalApprovalsRequired,
      //      satisfied: decision.approvalsSatisfied,
      //      missing: decision.approvalsMissing
      //    }
      //  : undefined
    }
  }

  private async opaEvaluate(evaluation: EvaluationRequest): Promise<Result[]> {
    if (!this.opa) {
      throw new OpenPolicyAgentException({
        message: 'Open Policy Agent engine not loaded',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }

    // NOTE: When we evaluate an input against the Rego policy core, it returns
    // an array of results with an inner result. We perform a typecast here to
    // satisfy TypeScript compiler. Later, we parse the schema a few lines
    // below to ensure type-safety for data coming from external sources.
    const results = (await this.opa.evaluate(toInput(evaluation), POLICY_ENTRYPOINT)) as { result: unknown }[]

    const parse = z.array(resultSchema).safeParse(results.map(({ result }) => result))

    if (parse.success) {
      return parse.data
    }

    throw new OpenPolicyAgentException({
      message: 'Invalid Open Policy Agent result schema',
      suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      context: {
        results,
        error: parse.error.errors
      }
    })
  }

  decide(results: Result[]) {
    const implicitForbid = results.some(this.isImplictForbid)
    const anyExplicitForbid = results.some(this.isExplictForbid)
    const allPermit = results.every(this.isPermit)
    const anyPermitWithMissingApprovals = results.some(this.isPermitMissingApproval)

    if (implicitForbid || anyExplicitForbid) {
      return {
        originalResponse: results,
        decision: Decision.FORBID,
        approvalsMissing: [],
        approvalsSatisfied: []
      }
    }

    // Collect all the approvalsMissing & approvalsSatisfied using functional
    // map/flat operators
    const approvalsSatisfied = results
      .flatMap((result) => result.reasons?.flatMap((reason) => reason.approvalsSatisfied))
      .filter((v) => !!v)
    const approvalsMissing = results
      .flatMap((result) => result.reasons?.flatMap((reason) => reason.approvalsMissing))
      .filter((v) => !!v)
    const totalApprovalsRequired = approvalsMissing.concat(approvalsSatisfied)

    const decision = allPermit && !anyPermitWithMissingApprovals ? Decision.PERMIT : Decision.CONFIRM

    return {
      originalResponse: results,
      decision,
      totalApprovalsRequired,
      approvalsMissing,
      approvalsSatisfied
    }
  }

  private isImplictForbid(result: Result): boolean {
    return result.default === true && result.permit === false && result.reasons?.length === 0
  }

  private isExplictForbid(result: Result): boolean {
    return Boolean(result.permit === false && result.reasons?.some((reason) => reason.type === 'forbid'))
  }

  private isPermit(result: Result): boolean {
    return Boolean(result.permit === true && result.reasons?.every((reason) => reason.type === 'permit'))
  }

  private isPermitMissingApproval(result: Result): boolean {
    return Boolean(result.reasons?.some((reason) => reason.type === 'permit' && reason.approvalsMissing.length > 0))
  }
}
