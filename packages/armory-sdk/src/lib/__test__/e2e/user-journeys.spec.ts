import { Entities, EntityUtil, HttpSource, SourceType, UserEntity, UserRole } from '@narval/policy-engine-shared'
import { buildSignerForAlg, getPublicKey, privateKeyToJwk } from '@narval/signature'
import { format } from 'date-fns'
import { v4 as uuid } from 'uuid'
import { AuthClient } from '../../auth/client'
import { AuthConfig } from '../../auth/type'
import { EntityStoreClient } from '../../data-store/client'
import { DataStoreConfig } from '../../data-store/type'
import { credential } from '../../data-store/util'
import { CreateClientResponseDto } from '../../http/client/auth'
import { sign } from '../../jose/sign'

const userPrivateKey = privateKeyToJwk('0xb248d01c1726beee3dc1f6d7291b5b040a19e60fafae954e9814f50334ec35a8')

const userPublicKey = getPublicKey(userPrivateKey)

const dataStorePrivateKey = privateKeyToJwk('0x2c26498d58150922a4e040fabd4aa736722e74e991d79240d2dad87d0ebcf0b3')

const getAuthHost = () => 'http://localhost:3005'

const getAuthAdminApiKey = () => '2cfa9d09a28f1de9108d18c38f5d5304e6708744c7d7194cbc754aef3455edc7e9270e2f28f052622257'

// IMPORTANT: The order of tests matters.
// These tests are meant to be run in series, not in parallel, because they
// represent an end-to-end user journey.
describe('User Journeys', () => {
  let client: CreateClientResponseDto

  const clientId = uuid()

  const user: UserEntity = {
    id: uuid(),
    role: UserRole.ADMIN
  }

  const entities: Partial<Entities> = {
    users: [user],
    credentials: [credential(user, userPublicKey)]
  }

  describe('As an admin, I want to create a new client', () => {
    let authClient: AuthClient
    let authConfig: AuthConfig

    beforeEach(async () => {
      authConfig = {
        host: getAuthHost(),
        // TODO: I don't need the client ID and secret for admin operations.
        // User and Admin are different journeys.
        clientId: 'foo',
        adminApiKey: getAuthAdminApiKey(),
        signer: {
          jwk: userPrivateKey,
          sign: await buildSignerForAlg(dataStorePrivateKey)
        }
      }

      authClient = new AuthClient(authConfig)
    })

    describe('createClient', () => {
      it('creates a new client', async () => {
        const entityStoreSource: HttpSource = {
          type: SourceType.HTTP,
          url: `${getAuthHost()}/data/entities?clientId=${clientId}`
        }

        const policyStoreSource: HttpSource = {
          type: SourceType.HTTP,
          // TODO: DevEx - Need util for these URLs
          url: `${getAuthHost()}/data/policies?clientId=${clientId}`
        }

        client = await authClient.createClient({
          name: `Armory SDK E2E test ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`,
          id: clientId,
          dataStore: {
            entity: {
              data: entityStoreSource,
              signature: entityStoreSource,
              keys: [getPublicKey(dataStorePrivateKey)]
            },
            policy: {
              data: policyStoreSource,
              signature: policyStoreSource,
              keys: [getPublicKey(dataStorePrivateKey)]
            }
          }
        })

        expect(client).not.toEqual(undefined)
      })
    })
  })

  describe('As a client, I want to set up my entity data store', () => {
    let dataStoreConfig: DataStoreConfig
    let entityStoreClient: EntityStoreClient

    beforeEach(async () => {
      dataStoreConfig = {
        host: getAuthHost(),
        clientId,
        // TODO: DevEx - Can I simplify this? I'd rather only have signer as a function
        // to avoid redundancy.
        signer: {
          jwk: userPrivateKey,
          sign: await buildSignerForAlg(dataStorePrivateKey)
        }
      }
      entityStoreClient = new EntityStoreClient(dataStoreConfig)
    })

    describe('sign', () => {
      it('fills a partial entities object before sign', async () => {
        const issuedAt = new Date()

        const signature = await entityStoreClient.sign(entities, { issuedAt })

        const expectedSignature = await sign({
          data: { ...EntityUtil.empty(), ...entities },
          clientId: dataStoreConfig.clientId,
          signer: dataStoreConfig.signer,
          issuedAt
        })

        expect(signature).toEqual(expectedSignature)
      })

      it('signs entities', async () => {
        const issuedAt = new Date()
        const fullEntities: Entities = { ...EntityUtil.empty(), ...entities }

        const signature = await entityStoreClient.sign(fullEntities, { issuedAt })

        const expectedSignature = await sign({
          data: fullEntities,
          clientId: dataStoreConfig.clientId,
          signer: dataStoreConfig.signer,
          issuedAt
        })

        expect(signature).toEqual(expectedSignature)
      })
    })

    describe('push', () => {
      it('sends entities and signature to data store server', async () => {
        const signature = await entityStoreClient.sign(entities)

        const store = await entityStoreClient.push(entities, signature)

        expect(store).toEqual({
          entity: {
            data: {
              ...EntityUtil.empty(),
              ...entities
            },
            signature
          },
          version: 1,
          latestSync: {
            success: expect.any(Boolean)
          }
        })
      })
    })

    describe('signAndPush', () => {
      it('sends entities and signature to data store server', async () => {
        const signOptions = { issuedAt: new Date() }
        const signature = await entityStoreClient.sign(entities, signOptions)

        const store = await entityStoreClient.signAndPush(entities, signOptions)

        expect(store).toEqual({
          entity: {
            data: {
              ...EntityUtil.empty(),
              ...entities
            },
            signature
          },
          version: 2,
          latestSync: {
            success: expect.any(Boolean)
          }
        })
      })
    })
  })
})
