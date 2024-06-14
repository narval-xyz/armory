import {
  Action,
  Criterion,
  Entities,
  EntityType,
  EntityUtil,
  HttpSource,
  Policy,
  SourceType,
  Then,
  UserEntity,
  UserRole
} from '@narval/policy-engine-shared'
import { buildSignerForAlg, getPublicKey, privateKeyToJwk } from '@narval/signature'
import { format } from 'date-fns'
import { v4 as uuid } from 'uuid'
import { AuthAdminClient } from '../../auth/client'
import { AuthAdminConfig } from '../../auth/type'
import { EntityStoreClient, PolicyStoreClient } from '../../data-store/client'
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

  const policies: Policy[] = [
    {
      id: uuid(),
      description: 'Required approval for an admin to transfer ERC-721 or ERC-1155 tokens',
      when: [
        {
          criterion: Criterion.CHECK_PRINCIPAL_ROLE,
          args: [UserRole.ADMIN]
        },
        {
          criterion: Criterion.CHECK_ACTION,
          args: [Action.SIGN_TRANSACTION]
        },
        {
          criterion: Criterion.CHECK_INTENT_TYPE,
          args: ['transferErc721', 'transferErc1155']
        },
        {
          criterion: Criterion.CHECK_APPROVALS,
          args: [
            {
              approvalCount: 2,
              countPrincipal: false,
              approvalEntityType: EntityType.User,
              entityIds: ['test-bob-user-uid', 'test-carol-user-uid']
            }
          ]
        }
      ],
      then: Then.PERMIT
    }
  ]

  describe('As an admin', () => {
    describe('I want to create a new client', () => {
      let authAdminClient: AuthAdminClient
      let authAdminConfig: AuthAdminConfig

      beforeEach(async () => {
        authAdminConfig = {
          host: getAuthHost(),
          adminApiKey: getAuthAdminApiKey()
        }

        authAdminClient = new AuthAdminClient(authAdminConfig)
      })

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

        client = await authAdminClient.createClient({
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

  describe('As a client', () => {
    describe('I want to set up my entity data store', () => {
      let dataStoreConfig: DataStoreConfig
      let entityStoreClient: EntityStoreClient

      const fullEntities: Entities = { ...EntityUtil.empty(), ...entities }

      beforeEach(async () => {
        dataStoreConfig = {
          host: getAuthHost(),
          clientId,
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

      describe('get', () => {
        it('returns latest entities and signature', async () => {
          const actualEntities = await entityStoreClient.get()

          expect(actualEntities).toEqual({
            entity: {
              data: fullEntities,
              signature: expect.any(String)
            }
          })
        })
      })
    })

    describe('I want to set up my policy data store', () => {
      let dataStoreConfig: DataStoreConfig
      let policyStoreClient: PolicyStoreClient

      beforeEach(async () => {
        dataStoreConfig = {
          host: getAuthHost(),
          clientId,
          signer: {
            jwk: userPrivateKey,
            sign: await buildSignerForAlg(dataStorePrivateKey)
          }
        }
        policyStoreClient = new PolicyStoreClient(dataStoreConfig)
      })

      describe('sign', () => {
        it('signs policies', async () => {
          const issuedAt = new Date()

          const signature = await policyStoreClient.sign(policies, { issuedAt })

          const expectedSignature = await sign({
            data: policies,
            clientId: dataStoreConfig.clientId,
            signer: dataStoreConfig.signer,
            issuedAt
          })

          expect(signature).toEqual(expectedSignature)
        })
      })

      describe('push', () => {
        it('sends policies and signature to data store managed host', async () => {
          const signature = await policyStoreClient.sign(policies)

          const store = await policyStoreClient.push(policies, signature)

          expect(store).toEqual({
            policy: {
              data: policies,
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
        it('sends entities and signature to data store managed host', async () => {
          const signOptions = { issuedAt: new Date() }
          const signature = await policyStoreClient.sign(policies, signOptions)

          const store = await policyStoreClient.signAndPush(policies, signOptions)

          expect(store).toEqual({
            policy: {
              data: policies,
              signature
            },
            version: 2,
            latestSync: {
              success: expect.any(Boolean)
            }
          })
        })
      })

      describe('get', () => {
        it('returns latest policies and signature', async () => {
          const actualPolicies = await policyStoreClient.get()

          expect(actualPolicies).toEqual({
            policy: {
              data: policies,
              signature: expect.any(String)
            }
          })
        })
      })
    })
  })
})
