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
import { POLICY_ENTRYPOINT } from '../open-policy-agent.constant'
import { OpenPolicyAgentException } from './exception/open-policy-agent.exception'
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
    if (!this.opa) {
      throw new OpenPolicyAgentException({
        message: 'Open Policy Agent engine not loaded',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }

    const { action } = request.request

    if (action !== Action.SIGN_TRANSACTION) {
      throw new OpenPolicyAgentException({
        message: 'Open Policy Agent engine unsupported action',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { action }
      })
    }

    const results = (await this.opa.evaluate(toInput(request), POLICY_ENTRYPOINT)) as Result[]

    // [ ] Finalize the decision
    // [ ] Build the EvaluationResponse
    // [ ] Maybe sign it? Must input the data somehow

    const decision = this.decide(results)

    return {
      decision: decision.decision,
      request: request.request,
      approvals: decision.totalApprovalsRequired?.length
        ? {
            required: decision.totalApprovalsRequired,
            satisfied: decision.approvalsSatisfied,
            missing: decision.approvalsMissing
          }
        : undefined
    }
  }

  decide(results: Result[]) {
    // Implicit Forbid - not root user and no rules matching
    const implicitForbid = results.some((r) => r?.default === true && r.permit === false && r.reasons?.length === 0)

    // Explicit Forbid - a Forbid rule type that matches & decides Forbid
    const anyExplicitForbid = results.some((r) => r.permit === false && r.reasons?.some((rr) => rr.type === 'forbid'))

    const allPermit = results.every((r) => r.permit === true && r.reasons?.every((rr) => rr.type === 'permit'))

    const anyPermitWithMissingApprovals = results.some((r) =>
      r.reasons?.some((rr) => rr.type === 'permit' && rr.approvalsMissing.length > 0)
    )

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
      .flatMap((r) => r.reasons?.flatMap((rr) => rr.approvalsSatisfied))
      .filter((v) => !!v)
    const approvalsMissing = results.flatMap((r) => r.reasons?.flatMap((rr) => rr.approvalsMissing)).filter((v) => !!v)
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
}
