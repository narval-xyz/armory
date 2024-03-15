import { Action, Engine, Entities, EvaluationRequest, EvaluationResponse, Policy } from '@narval/policy-engine-shared'
import { HttpStatus } from '@nestjs/common'
import { loadPolicy } from '@open-policy-agent/opa-wasm'
import { resolve } from 'path'
import { v4 } from 'uuid'
import { OpenPolicyAgentException } from './exception/open-policy-agent.exception'
import { build } from './util/wasm-build.util'

type PromiseType<T extends Promise<unknown>> = T extends Promise<infer U> ? U : never

type OpaEngine = PromiseType<ReturnType<typeof loadPolicy>>

export class OpenPolicyAgentEngine implements Engine<OpenPolicyAgentEngine> {
  private policies: Policy[]

  private entities: Entities

  private opa?: OpaEngine

  constructor(policies?: Policy[], entities?: Entities) {
    this.entities = entities || {
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

    this.policies = policies || []
  }

  setPolicies(policies: Policy[]): OpenPolicyAgentEngine {
    this.policies = policies

    return this
  }

  getPolicies(): Policy[] {
    return this.policies
  }

  getOpenPolicyAgentInstance(): OpaEngine | undefined {
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
