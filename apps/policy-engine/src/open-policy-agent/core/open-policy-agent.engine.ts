import {
  Action,
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
import {
  Hex,
  Payload,
  PrivateKey,
  PublicKey,
  SigningAlg,
  base64UrlToHex,
  buildSignerEip191,
  decode,
  hash,
  secp256k1PrivateKeyToJwk,
  signJwt,
  verifyJwt
} from '@narval/signature'
import { HttpStatus } from '@nestjs/common'
import { loadPolicy } from '@open-policy-agent/opa-wasm'
import { compact } from 'lodash/fp'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { POLICY_ENTRYPOINT } from '../open-policy-agent.constant'
import { OpenPolicyAgentException } from './exception/open-policy-agent.exception'
import { resultSchema } from './schema/open-policy-agent.schema'
import { Input, OpenPolicyAgentInstance, Result } from './type/open-policy-agent.type'
import { toData, toInput } from './util/evaluation.util'
import { getRegoRuleTemplatePath } from './util/rego-transpiler.util'
import { build, getRegoCorePath } from './util/wasm-build.util'

export class OpenPolicyAgentEngine implements Engine<OpenPolicyAgentEngine> {
  private policies: Policy[]

  private entities: Entities

  private resourcePath: string

  // TODO: (@wcalderipe, 20/03/24) How we store and recover a signing key will
  // change very soon because we need to support MPC signing.
  // This code is here just for feature parity with the existing proof of
  // concept.
  private privateKey: Hex

  private opa?: OpenPolicyAgentInstance

  constructor(params: { policies: Policy[]; entities: Entities; resourcePath: string; privateKey: Hex }) {
    this.entities = params.entities
    this.policies = params.policies
    this.privateKey = params.privateKey
    this.resourcePath = params.resourcePath
  }

  static empty(params: { resourcePath: string; privateKey: Hex }): OpenPolicyAgentEngine {
    return new OpenPolicyAgentEngine({
      entities: EntityUtil.empty(),
      policies: [],
      resourcePath: params.resourcePath,
      privateKey: params.privateKey
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
      const wasm = await build({
        policies: this.getPolicies(),
        path: `/tmp/armory-policy-bundle-${uuid()}`,
        regoCorePath: getRegoCorePath(this.resourcePath),
        regoRuleTemplatePath: getRegoRuleTemplatePath(this.resourcePath)
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

  async evaluate(evaluation: EvaluationRequest): Promise<EvaluationResponse> {
    const { action } = evaluation.request

    if (action !== Action.SIGN_TRANSACTION) {
      throw new OpenPolicyAgentException({
        message: 'Open Policy Agent engine unsupported action',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { action }
      })
    }

    const message = hash(evaluation.request)
    const principalCredential = await this.verifySignature(evaluation.authentication, message)

    const approvalsCredential = await Promise.all(
      (evaluation.approvals ? evaluation.approvals : []).map((signature) => this.verifySignature(signature, message))
    )

    const results = await this.opaEvaluate(evaluation, {
      principal: principalCredential,
      approvals: approvalsCredential
    })
    const decision = this.decide(results)

    const response: EvaluationResponse = {
      decision: decision.decision,
      approvals: decision.approvals,
      request: evaluation.request
    }

    if (response.decision === Decision.PERMIT) {
      return {
        ...response,
        accessToken: {
          value: await this.sign({
            principalCredential,
            message
          })
        }
      }
    }

    return response
  }

  private async verifySignature(signature: JwtString, message: string) {
    const { header } = decode(signature)

    const credential = this.getCredential(header.kid)

    if (!credential) {
      throw new OpenPolicyAgentException({
        message: 'Signature credential not found',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND
      })
    }

    const validJwt = await verifyJwt(signature, credential.key)

    if (validJwt.payload.requestHash !== message) {
      throw new OpenPolicyAgentException({
        message: 'Signature hash mismatch',
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    }

    return credential
  }

  private getCredential(id: string): CredentialEntity | null {
    return this.getEntities().credentials.find((cred) => cred.id === id) || null
  }

  private async opaEvaluate(
    evaluation: EvaluationRequest,
    credentials: { principal: CredentialEntity; approvals?: CredentialEntity[] }
  ): Promise<Result[]> {
    if (!this.opa) {
      throw new OpenPolicyAgentException({
        message: 'Open Policy Agent engine not loaded',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }

    const input: Input = {
      ...toInput(evaluation),
      principal: credentials.principal,
      // TODO: Why the EvaluationRequest specifies approvals as optional but
      // the OPA input doesn't?
      approvals: credentials.approvals || []
    }

    // NOTE: When we evaluate an input against the Rego policy core, it returns
    // an array of results with an inner result. We perform a typecast here to
    // satisfy TypeScript compiler. Later, we parse the schema a few lines
    // below to ensure type-safety for data coming from external sources.
    const results = (await this.opa.evaluate(input, POLICY_ENTRYPOINT)) as { result: unknown }[]

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

  private async sign(params: { principalCredential: CredentialEntity; message: string }): Promise<JwtString> {
    const engineJwk: PrivateKey = secp256k1PrivateKeyToJwk(this.privateKey)
    const principalJwk: PublicKey = params.principalCredential.key

    const payload: Payload = {
      requestHash: params.message,
      sub: params.principalCredential.userId,
      // TODO: iat & exp values must be arguments, cannot generate timestamps
      // because of cluster mis-match
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes
      // TODO: allow client-specific; should come from config
      iss: 'https://armory.narval.xyz',
      // aud: TODO
      // jti: TODO
      cnf: principalJwk
    }

    if (!engineJwk.d) {
      throw new OpenPolicyAgentException({
        message: 'Missing signing private key',
        suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }

    return signJwt(payload, engineJwk, { alg: SigningAlg.EIP191 }, buildSignerEip191(base64UrlToHex(engineJwk.d)))
  }
}
