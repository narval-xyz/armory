import {
  Entities,
  EntityStore,
  EvaluationResponse,
  JwtString,
  Policy,
  PolicyStore,
  Request
} from '@narval/policy-engine-shared'
import { hash, signJwt, verifyJwt } from '@narval/signature'
import axios from 'axios'
import { Config, SignConfig, getConfig } from './domain'
import PolicyEngine from './evaluation-request'
import { VaultRequestManager } from './vault'

type SignedData = unknown

export class NarvalSdk {
  #config: Config

  #policyEngine: PolicyEngine

  #vault: VaultRequestManager

  constructor(config: Config, evaluationRequest?: PolicyEngine, vault?: VaultRequestManager) {
    this.#config = config

    this.#policyEngine = evaluationRequest || new PolicyEngine(config.engine)

    this.#vault = vault || new VaultRequestManager(config.vault)
  }

  async evaluate(request: Request, config: SignConfig): Promise<EvaluationResponse> {
    const evaluationRequest = await this.#policyEngine.sign(request, config)
    console.log('signing worked: ', evaluationRequest)
    const res = await this.#policyEngine.send(evaluationRequest)
    return res
  }

  // Check that the authentication token was issued by the engine tied to this client. If so, put in a URL.
  async save(authentication: JwtString, url: string, data: unknown): Promise<{ success: boolean }> {
    const verified = await verifyJwt(authentication, this.#config.engine.pubKey)
    // TODO: Define claims that needs to be verified
    // e.g.: hashed data must match authentication hashed data
    if (!verified) {
      throw new Error('Invalid authentication')
    }
    const res = await axios.put(url, data)
    if (res.status !== 200) {
      return { success: false }
    }
    return { success: true }
  }

  //
  async sign(accessToken: JwtString): Promise<SignedData> {
    const res = await this.#vault.sign(accessToken)
    return res
  }

  async saveEntities(entities: Entities, signConfig?: SignConfig): Promise<EntityStore> {
    const config = getConfig(this.#config.signConfig, signConfig)

    const entityStore: EntityStore = {
      data: entities,
      signature: await this.#signData(entities, config)
    }

    const res = await axios.put(this.#config.dataStore.entityUrl, entityStore)

    console.log('res: ', res)
    await axios.post(`${this.#config.engine.url}/clients/sync`, null, {
      headers: {
        'x-client-id': this.#config.engine.id,
        'x-client-secret': this.#config.engine.secret
      }
    })
    return entityStore
  }

  async savePolicies(policies: Policy[], signConfig?: SignConfig): Promise<PolicyStore> {
    const config = getConfig(this.#config.signConfig, signConfig)

    const policyStore: PolicyStore = {
      data: policies,
      signature: await this.#signData(policies, config)
    }
    const res = await axios.put(this.#config.dataStore.policyUrl, policyStore)

    console.log('res: ', res)
    return policyStore
  }

  async #signData(data: unknown, signConfig?: SignConfig): Promise<JwtString> {
    const config = getConfig(this.#config.signConfig, signConfig)

    const payload = {
      requestHash: hash(data),
      sub: config.jwk.kid,
      iss: this.#config.engine.id,
      iat: new Date().getTime()
    }

    const signingOpts = config.opts || {}
    const authentication = config.signer
      ? await signJwt(payload, config.jwk, signingOpts, config.signer)
      : await signJwt(payload, config.jwk, signingOpts)

    return authentication
  }
}
