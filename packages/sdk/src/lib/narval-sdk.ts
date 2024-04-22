import { Decision, Entities, EvaluationResponse, JwtString, Policy, Request } from '@narval-xyz/policy-engine-domain'
import { Jwk, SignConfig } from '@narval-xyz/signature'
import PolicyEngine from './builders/evaluation-request'
import { DataStoreManager } from './data-store'
import { NarvalSdkConfig } from './domain'
import { VaultRequestManager } from './vault'

type SignedData = unknown

export class NarvalSdk {
  #policyEngine: PolicyEngine

  #dataStore: DataStoreManager

  #vault: VaultRequestManager

  constructor(
    config: NarvalSdkConfig,
    evaluationRequest?: PolicyEngine,
    dataStore?: DataStoreManager,
    vault?: VaultRequestManager
  ) {
    this.#policyEngine = evaluationRequest || new PolicyEngine(config.engine)

    this.#dataStore = dataStore || new DataStoreManager(config.dataStore)

    this.#vault = vault || new VaultRequestManager(config.vault)
  }

  async evaluate(request: Request, principal: Jwk, signConfig?: SignConfig): Promise<EvaluationResponse> {
    const evaluationRequest = await this.#policyEngine.sign(request, principal, signConfig)
    const res = await this.#policyEngine.send(evaluationRequest)
    return res
  }

  // TODO: define a type for AccessToken
  async sign(accessToken: JwtString): Promise<SignedData> {
    const res = await this.#vault.sign(accessToken)
    return res
  }

  async setEntities(entities: Entities): Promise<EvaluationResponse> {
    // TODO: Build evaluation request and send it to the policy engine
    const res: EvaluationResponse = {
      decision: Decision.PERMIT,
      request: {
        action: 'setEntities',
        entities
      } as unknown as Request
    }
    await this.#dataStore.setEntities(entities)
    return res
  }

  async setPolicies(policies: Policy[], jwk: Jwk, signConfig?: SignConfig): Promise<EvaluationResponse> {
    // TODO: Build evaluation request and send it to the policy engine
    const res: EvaluationResponse = {
      decision: Decision.PERMIT,
      request: {
        action: 'setPolicies',
        policies
      } as unknown as Request
    }
    await this.#dataStore.setPolicies(policies, jwk, signConfig)
    return res
  }
}
