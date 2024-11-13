import {
  ApprovalRequirement,
  CredentialEntity,
  Decision,
  Engine,
  Entities,
  EntityUtil,
  EvaluationRequest,
  EvaluationResponse,
  JwtString,
  Policy
} from '@narval/policy-engine-shared'
import { decodeJwt, hash, verifyJwt } from '@narval/signature'
import { Intent } from '@narval/transaction-request-intent'
import { HttpStatus } from '@nestjs/common'
import { loadPolicy } from '@open-policy-agent/opa-wasm'
import { Tracer } from '@opentelemetry/api'
import { compact } from 'lodash/fp'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { POLICY_ENTRYPOINT } from '../open-policy-agent.constant'
import { OpenPolicyAgentException } from './exception/open-policy-agent.exception'
import { resultSchema } from './schema/open-policy-agent.schema'
import { OpenPolicyAgentInstance, Result } from './type/open-policy-agent.type'
import { toData, toInput } from './util/evaluation.util'
import { getRegoRuleTemplatePath } from './util/rego-transpiler.util'
import { build, getRegoCorePath } from './util/wasm-build.util'

export class OpenPolicyAgentEngine implements Engine<OpenPolicyAgentEngine> {
  private policies: Policy[]

  private entities: Entities

  private resourcePath: string

  private opa?: OpenPolicyAgentInstance

  private tracer?: Tracer

  constructor(params: { policies: Policy[]; entities: Entities; resourcePath: string; tracer?: Tracer }) {
    this.entities = params.entities
    this.policies = params.policies
    this.resourcePath = params.resourcePath
    this.tracer = params.tracer
  }

  static empty(params: { resourcePath: string }): OpenPolicyAgentEngine {
    return new OpenPolicyAgentEngine({
      entities: EntityUtil.empty(),
      policies: [],
      resourcePath: params.resourcePath
    })
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
      const wasmBuildSpan = this.tracer?.startSpan(`${OpenPolicyAgentEngine.name}.load.wasmBuild`)
      const wasm = await build({
        policies: this.getPolicies(),
        path: `/tmp/armory-policy-bundle-${uuid()}`,
        regoCorePath: getRegoCorePath(this.resourcePath),
        regoRuleTemplatePath: getRegoRuleTemplatePath(this.resourcePath),
        tracer: this.tracer
      })

      wasmBuildSpan?.end()

      const loadPolicySpan = this.tracer?.startSpan(`${OpenPolicyAgentEngine.name}.load.loadPolicy`)
      // Each page is 64kb and it defaults it to 5.
      // We arbitrarily initialise it to 1000 instead to give us more mb of memory.
      this.opa = await loadPolicy(wasm, this.megabytesToWasmPages(64), {
        'time.now_ns': () => new Date().getTime() * 1000000,
        'time.format': () => new Date().toISOString().split('T')[0],
        'time.parse_ns': () => {
          const now = new Date()
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          return startOfDay.getTime() * 1000000
        }
      })

      loadPolicySpan?.end()

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

  async evaluate(evaluation: EvaluationRequest): Promise<EvaluationResponse> {
    const message = hash(evaluation.request)

    const principalCredential = await this.verifySignature(evaluation.authentication, message)

    const approvalsCredential = await Promise.all(
      (evaluation.approvals || []).map((signature) => this.verifySignature(signature, message))
    )

    const { results, transactionRequestIntent } = await this.opaEvaluate(evaluation, {
      principal: principalCredential,
      approvals: [...approvalsCredential, principalCredential] // Include the Principal as an approver
    })
    const decision = this.decide(results)

    const response: EvaluationResponse = {
      decision: decision.decision,
      approvals: decision.approvals,
      request: evaluation.request,
      principal: decision.decision === Decision.PERMIT ? principalCredential : undefined,
      metadata: evaluation.metadata,
      transactionRequestIntent
    }

    return response
  }

  private async verifySignature(signature: JwtString, message: string) {
    const { header } = decodeJwt(signature)

    const credential = this.getCredential(header.kid)

    if (!credential) {
      throw new OpenPolicyAgentException({
        message: 'Signature credential not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND
      })
    }

    const { key } = credential

    const validJwt = await verifyJwt(signature, key)

    if (validJwt.payload.requestHash !== message) {
      throw new OpenPolicyAgentException({
        message: 'Signature hash mismatch',
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    }

    return credential
  }

  private getCredential(id: string): CredentialEntity | null {
    // TODO: BEFORE MERGE, I just spend a bunch of time debugging this but
    // there's an implicity assumption the entity ID is the same as the JWK ID.
    // That's redundant and error-prone. If we always have an ID in the key, we
    // should just drop the top level ID.
    // Drop the top-level ID will cascade in the logic to associate an user to
    // a cred.
    return this.getEntities().credentials.find((cred) => cred.id.toLowerCase() === id.toLowerCase()) || null
  }

  private async opaEvaluate(
    evaluation: EvaluationRequest,
    credentials: { principal: CredentialEntity; approvals?: CredentialEntity[] }
  ): Promise<{ results: Result[]; transactionRequestIntent?: Intent }> {
    if (!this.opa) {
      throw new OpenPolicyAgentException({
        message: 'Open Policy Agent engine not loaded',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }

    const input = toInput({
      evaluation,
      principal: credentials.principal,
      approvals: credentials.approvals
    })

    // NOTE: When we evaluate an input against the Rego policy core, it returns
    // an array of results with an inner result. We perform a typecast here to
    // satisfy TypeScript compiler. Later, we parse the schema a few lines
    // below to ensure type-safety for data coming from external sources.

    const results = (await this.opa.evaluate(input, POLICY_ENTRYPOINT)) as { result: unknown }[]

    const parse = z.array(resultSchema).safeParse(results.map(({ result }) => result))

    if (parse.success) {
      return {
        results: parse.data,
        transactionRequestIntent: input.intent
      }
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

  /**
   * Computes OPA's query results into a final decision. This step is also
   * known as "post-evaluation".
   */
  decide(results: Result[]): {
    decision: Decision
    approvals?: {
      required: ApprovalRequirement[]
      missing: ApprovalRequirement[]
      satisfied: ApprovalRequirement[]
    }
  } {
    const implicitForbid = results.some(this.isImplictForbid)
    const anyExplicitForbid = results.some(this.isExplictForbid)
    const allPermit = results.every(this.isPermit)
    const permitsMissingApproval = results.some(this.isPermitMissingApproval)

    if (implicitForbid || anyExplicitForbid) {
      return { decision: Decision.FORBID }
    }

    const approvalsSatisfied = compact(
      results.flatMap((result) => result.reasons?.flatMap((reason) => reason.approvalsSatisfied)).filter((v) => !!v)
    )
    const approvalsMissing = compact(
      results.flatMap((result) => result.reasons?.flatMap((reason) => reason.approvalsMissing)).filter((v) => !!v)
    )
    const approvalsRequired = compact(approvalsMissing.concat(approvalsSatisfied))

    const decision = allPermit && !permitsMissingApproval ? Decision.PERMIT : Decision.CONFIRM

    return {
      decision,
      approvals: {
        missing: approvalsMissing,
        required: approvalsRequired,
        satisfied: approvalsSatisfied
      }
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

  /**
   * Converts a given megabytes number into WebAssembly page units.
   *
   * @see https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Memory/Memory
   * @see https://github.com/open-policy-agent/npm-opa-wasm/blob/c02cf137bf3e7c3a15cb619acc14df3d161509ad/src/opa.js#L459-L478
   */
  private megabytesToWasmPages(mb: number): number {
    const pageSizeInKb = 64

    return Math.floor((mb * 1000) / pageSizeInKb)
  }
}
