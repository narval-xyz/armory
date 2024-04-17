import { Entities, EntityStore, Policy, PolicyStore } from '@narval/policy-engine-shared'
import {
  Alg,
  Payload,
  SigningAlg,
  buildSignerEip191,
  hash,
  privateKeyToJwk,
  signJwt,
  verifyJwt
} from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { ACCOUNT, UNSAFE_PRIVATE_KEY } from 'packages/policy-engine-shared/src/lib/dev.fixture'
import { DataStoreRepository } from '../../persistence/repository/data-store.repository'

@Injectable()
export class DataStoreService {
  constructor(private dataStoreRepository: DataStoreRepository) {}

  async getEntities(orgId: string) {
    const dataStore = await this.dataStoreRepository.getLatestDataStore(orgId)
    return dataStore?.data.entity.data
  }

  async getPolicies(orgId: string) {
    const dataStore = await this.dataStoreRepository.getLatestDataStore(orgId)
    return dataStore?.data.policy.data
  }

  async setEntities(orgId: string, entities: Entities) {
    const signature = await this.signDataPayload(entities)
    const entity: EntityStore = {
      data: entities,
      signature
    }
    const dataStore = await this.dataStoreRepository.getLatestDataStore(orgId)

    if (!dataStore) {
      const policy: PolicyStore = {
        data: [],
        signature: ''
      }

      return this.dataStoreRepository.setDataStore({
        orgId,
        version: 1,
        data: { entity, policy }
      })
    } else {
      const { policy } = dataStore.data

      return this.dataStoreRepository.setDataStore({
        orgId,
        version: dataStore.version + 1,
        data: { entity, policy }
      })
    }
  }

  async setPolicies(orgId: string, policies: Policy[]) {
    const signature = await this.signDataPayload(policies)
    const policy: PolicyStore = {
      data: policies,
      signature
    }
    const dataStore = await this.dataStoreRepository.getLatestDataStore(orgId)

    if (!dataStore) {
      const entity: EntityStore = {
        data: {} as Entities,
        signature: ''
      }

      return this.dataStoreRepository.setDataStore({
        orgId,
        version: 1,
        data: { entity, policy }
      })
    } else {
      const { entity } = dataStore.data

      return this.dataStoreRepository.setDataStore({
        orgId,
        version: dataStore.version + 1,
        data: { entity, policy }
      })
    }
  }

  private async signDataPayload(data: Entities | Policy[]) {
    const jwk = privateKeyToJwk(UNSAFE_PRIVATE_KEY.Root, Alg.ES256K)

    const payload: Payload = {
      data: hash(data),
      sub: ACCOUNT.Root.address,
      iss: 'https://armory.narval.xyz',
      iat: Math.floor(Date.now() / 1000)
    }

    const signature = await signJwt(
      payload,
      jwk,
      { alg: SigningAlg.EIP191 },
      buildSignerEip191(UNSAFE_PRIVATE_KEY.Root)
    )

    const verify = await verifyJwt(signature, jwk)

    console.log({ signature, verify })

    return signature
  }
}
