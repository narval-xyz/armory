import { Action, Engine, Entities, EvaluationRequest, EvaluationResponse, Policy } from '@narval/policy-engine-shared'
import { HttpStatus } from '@nestjs/common'
import { loadPolicy } from '@open-policy-agent/opa-wasm'
import { OpenPolicyAgentException } from './open-policy-agent.exception'

type PromiseType<T extends Promise<unknown>> = T extends Promise<infer U> ? U : never

type OpaEngine = PromiseType<ReturnType<typeof loadPolicy>>

export class OpenPolicyAgentEngine implements Engine<OpenPolicyAgentEngine> {
  private policies: Policy[] = []

  private entities: Entities = {
    addressBook: [],
    credentials: [],
    tokens: [],
    userGroupMembers: [],
    userGroups: [],
    userWallets: [],
    users: [],
    walletGroupMembers: [],
    walletGroups: [],
    wallets: []
  }

  public opa?: OpaEngine

  public wasm: Buffer

  constructor(wasm: Buffer) {
    this.wasm = wasm
  }

  setPolicies(policies: Policy[]): OpenPolicyAgentEngine {
    this.policies = policies

    return this
  }

  getPolicies(): Policy[] {
    return this.policies
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
      const opa = await loadPolicy(this.wasm, undefined, {
        'time.now_ns': () => new Date().getTime() * 1000000
      })

      // opa.setData(this.getData())

      this.opa = opa

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

    throw Error('not implemented')
  }
}
