import { Entities, EntityUtil, UserEntity, UserRole } from '@narval/policy-engine-shared'
import { buildSignerForAlg, getPublicKey, hash, privateKeyToJwk } from '@narval/signature'
import { EntityStoreClient } from '../../../data-store/client'
import { credential } from '../../../data-store/util'
import { DataStoreConfig } from '../../type'

const userPrivateKey = privateKeyToJwk('0xb248d01c1726beee3dc1f6d7291b5b040a19e60fafae954e9814f50334ec35a8')

const userPublicKey = getPublicKey(userPrivateKey)

const dataStorePrivateKey = privateKeyToJwk('0x2c26498d58150922a4e040fabd4aa736722e74e991d79240d2dad87d0ebcf0b3')

describe(EntityStoreClient.name, () => {
  let entityStoreClient: EntityStoreClient
  let config: DataStoreConfig

  const user: UserEntity = {
    id: 'test-user-id',
    role: UserRole.ADMIN
  }

  const entities = {
    users: [user],
    credentials: [credential(user, userPublicKey)]
  }

  beforeEach(async () => {
    config = {
      host: 'http://localhost:3005',
      clientId: 'test-client-id',
      signer: {
        jwk: userPrivateKey,
        // TODO: Use buildSignerForAlg
        sign: await buildSignerForAlg(dataStorePrivateKey)
      }
    }

    entityStoreClient = new EntityStoreClient(config)
  })

  describe('sign', () => {
    it('fills a partial entities object before sign', async () => {
      const signature = await entityStoreClient.sign(entities)

      const expectedSignature = await config.signer.sign(hash({ ...EntityUtil.empty(), ...entities }))

      expect(signature).toEqual(expectedSignature)
    })

    it('signs entities', async () => {
      const fullEntities: Entities = { ...EntityUtil.empty(), ...entities }

      const signature = await entityStoreClient.sign(fullEntities)

      const expectedSignature = await config.signer.sign(hash(fullEntities))

      expect(signature).toEqual(expectedSignature)
    })
  })

  // describe('push', () => {
  //   it('sends entities and signature to data store server', async () => {
  //     const signature = await entityStoreClient.sign(entities)
  //
  //     await entityStoreClient.push(entities, signature)
  //   })
  // })
})
