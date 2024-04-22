import {
  Entities,
  EntityStore,
  Policy,
  PolicyStore,
  entityStoreSchema,
  policyStoreSchema
} from '@narval-xyz/policy-engine-domain'
import { Jwk, SignConfig } from '@narval-xyz/signature'
import axios from 'axios'
import { DataStoreConfig } from './domain'

export class DataStoreManager {
  #config: DataStoreConfig

  constructor(config: DataStoreConfig) {
    this.#config = config
  }

  async setEntities(entities: Entities): Promise<unknown> {
    const res = await axios.put(this.#config.entityUrl, entities)
    return res.data
  }

  async setPolicies(policies: Policy[], jwk: Jwk, signConfig?: SignConfig): Promise<unknown> {
    const res = await axios.put(this.#config.policyUrl, policies)
    jwk as Jwk
    signConfig as SignConfig
    return res.data
  }

  async getEntities(): Promise<EntityStore> {
    const res = await axios.get(this.#config.entityUrl)
    const entityStore = entityStoreSchema.parse(res.data)
    return entityStore
  }

  async getPolicies(): Promise<PolicyStore> {
    const res = await axios.get<PolicyStore>(this.#config.policyUrl)
    const policyStore = policyStoreSchema.parse(res.data)
    return policyStore
  }
}
