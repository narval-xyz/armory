import { Entities, EntityStore } from '@narval/policy-engine-shared'
import { Alg, Payload, SigningAlg, buildSignerEip191, hash, privateKeyToJwk, signJwt } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { ACCOUNT, UNSAFE_PRIVATE_KEY } from 'packages/policy-engine-shared/src/lib/dev.fixture'
import { EntityDataStoreRepository } from '../../persistence/repository/entity-data-store.repository'

@Injectable()
export class EntityDataStoreService {
  constructor(private entitydataStoreRepository: EntityDataStoreRepository) {}

  async getEntities(orgId: string): Promise<EntityStore | null> {
    const entityStore = await this.entitydataStoreRepository.getLatestDataStore(orgId)

    if (!entityStore) {
      return null
    }

    return EntityStore.parse(entityStore.data)
  }

  async setEntities(orgId: string, data: Entities) {
    const signature = await this.signDataPayload(data)
    const entity: EntityStore = { data, signature }
    const version = await this.entitydataStoreRepository.getLatestVersion(orgId)

    return this.entitydataStoreRepository.setDataStore({
      orgId,
      version: version + 1,
      data: entity
    })
  }

  private async signDataPayload(data: Entities) {
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

    return signature
  }
}
