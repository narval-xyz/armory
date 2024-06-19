import {
  Action,
  CreateAuthorizationRequest,
  Criterion,
  Decision,
  Entities,
  EntityUtil,
  Policy,
  Then,
  UserEntity,
  UserRole
} from '@narval/policy-engine-shared'
import { buildSignerForAlg, getPublicKey, hash, privateKeyToJwk, signJwt } from '@narval/signature'
import { format } from 'date-fns'
import { v4 as uuid } from 'uuid'
import { AuthAdminClient, AuthClient } from '../../auth/client'
import { AuthAdminConfig, AuthConfig } from '../../auth/type'
import { EntityStoreClient, PolicyStoreClient } from '../../data-store/client'
import { DataStoreConfig } from '../../data-store/type'
import { createHttpDataStore, credential } from '../../data-store/util'
import { AuthorizationResponseDtoStatusEnum, CreateClientResponseDto } from '../../http/client/auth'
import { SignOptions, Signer } from '../../shared/type'

const TEST_TIMEOUT_MS = 30_000

jest.setTimeout(TEST_TIMEOUT_MS)

const userPrivateKey = privateKeyToJwk('0xb248d01c1726beee3dc1f6d7291b5b040a19e60fafae954e9814f50334ec35a8')

const userPublicKey = getPublicKey(userPrivateKey)

const dataStorePrivateKey = privateKeyToJwk('0x2c26498d58150922a4e040fabd4aa736722e74e991d79240d2dad87d0ebcf0b3')

const getAuthHost = () => 'http://localhost:3005'

const getAuthAdminApiKey = () => '2cfa9d09a28f1de9108d18c38f5d5304e6708744c7d7194cbc754aef3455edc7e9270e2f28f052622257'

const getExpectedSignature = (input: { data: unknown; signer: Signer; clientId: string } & SignOptions) => {
  const { data, signer, clientId, issuedAt } = input

  return signJwt(
    {
      data: hash(data),
      sub: signer.jwk.kid,
      iss: clientId,
      iat: issuedAt?.getTime()
    },
    signer.jwk,
    {
      alg: signer.alg
    },
    signer.sign
  )
}

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
        }
      ],
      then: Then.PERMIT
    }
  ]

  describe('As an admin', () => {
    let authAdminClient: AuthAdminClient
    let authAdminConfig: AuthAdminConfig

    beforeEach(async () => {
      authAdminConfig = {
        host: getAuthHost(),
        adminApiKey: getAuthAdminApiKey()
      }

      authAdminClient = new AuthAdminClient(authAdminConfig)
    })

    it('I can create a new client in the authorization server', async () => {
      client = await authAdminClient.createClient({
        name: `Armory SDK E2E test ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`,
        id: clientId,
        dataStore: createHttpDataStore({
          host: getAuthHost(),
          clientId,
          keys: [getPublicKey(dataStorePrivateKey)]
        })
      })

      expect(client).not.toEqual(undefined)
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
          clientId: client.id,
          clientSecret: client.clientSecret,
          signer: {
            jwk: dataStorePrivateKey,
            sign: await buildSignerForAlg(dataStorePrivateKey)
          }
        }
        entityStoreClient = new EntityStoreClient(dataStoreConfig)
      })

      it('I can sign a partial entities object', async () => {
        const issuedAt = new Date()

        const signature = await entityStoreClient.sign(entities, { issuedAt })

        const expectedSignature = await getExpectedSignature({
          // If the input is a partial entities, the client will populate it
          // pushing to the server. Thus, the expected data hash is from the
          // full entities not the partial.
          data: fullEntities,
          issuedAt,
          ...dataStoreConfig
        })

        expect(signature).toEqual(expectedSignature)
      })

      it('I can sign a complete entities object', async () => {
        const issuedAt = new Date()

        const signature = await entityStoreClient.sign(fullEntities, { issuedAt })

        const expectedSignature = await getExpectedSignature({
          data: fullEntities,
          issuedAt,
          ...dataStoreConfig
        })

        expect(signature).toEqual(expectedSignature)
      })

      it('I can push entities and signature to a managed data store', async () => {
        const signature = await entityStoreClient.sign(entities)

        const store = await entityStoreClient.push({
          data: entities,
          signature
        })

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

      it('I can sign and push entities and signature to a managed data store', async () => {
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

      it('I can fetch the latest version of the data store', async () => {
        const actualEntities = await entityStoreClient.fetch()

        expect(actualEntities).toEqual({
          entity: {
            data: fullEntities,
            signature: expect.any(String)
          }
        })
      })

      it('I can trigger a data store sync', async () => {
        const result = await entityStoreClient.sync()

        expect(result).toEqual(true)
      })
    })

    describe('I want to set up my policy data store', () => {
      let dataStoreConfig: DataStoreConfig
      let policyStoreClient: PolicyStoreClient

      beforeEach(async () => {
        dataStoreConfig = {
          host: getAuthHost(),
          clientId: client.id,
          clientSecret: client.clientSecret,
          signer: {
            jwk: dataStorePrivateKey,
            sign: await buildSignerForAlg(dataStorePrivateKey)
          }
        }
        policyStoreClient = new PolicyStoreClient(dataStoreConfig)
      })

      it('I can sign policies', async () => {
        const issuedAt = new Date()

        const signature = await policyStoreClient.sign(policies, { issuedAt })

        const expectedSignature = await getExpectedSignature({
          data: policies,
          issuedAt,
          ...dataStoreConfig
        })

        expect(signature).toEqual(expectedSignature)
      })

      it('I can push policies and signature to a managed data store', async () => {
        const signature = await policyStoreClient.sign(policies)

        const store = await policyStoreClient.push({
          data: policies,
          signature
        })

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

      it('I can sign and push policies and signature to a managed data store', async () => {
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

      it('I can fetch the latest version of the data store', async () => {
        const actualPolicies = await policyStoreClient.fetch()

        expect(actualPolicies).toEqual({
          policy: {
            data: policies,
            signature: expect.any(String)
          }
        })
      })

      it('I can trigger a data store sync', async () => {
        const result = await policyStoreClient.sync()

        expect(result).toEqual(true)
      })
    })

    describe('I want to request an access token', () => {
      let authConfig: AuthConfig
      let authClient: AuthClient

      const signTransaction: Omit<CreateAuthorizationRequest, 'authentication'> = {
        approvals: [],
        clientId,
        id: uuid(),
        request: {
          action: Action.SIGN_TRANSACTION,
          nonce: uuid(),
          resourceId: '68dc69bd-87d2-49d9-a5de-f482507b25c2',
          transactionRequest: {
            chainId: 1,
            data: '0x',
            from: '0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43',
            // It's crucial to test an E2E flow that includes a bigint value.
            // This is because we convert it into a string before transmitting
            // it, and decode it on the server side. A discrepancy between the
            // SDK and server types can result in an invalid hash.
            gas: 5000n,
            nonce: 0,
            to: '0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23',
            type: '2',
            value: '0x'
          }
        }
      }

      beforeEach(async () => {
        authConfig = {
          host: getAuthHost(),
          clientId,
          signer: {
            jwk: userPrivateKey,
            sign: await buildSignerForAlg(userPrivateKey)
          },
          pollingTimeoutMs: TEST_TIMEOUT_MS - 10_000,
          // In a local AS and PE, 250 ms is equivalent to ~3 requests until
          // the job is processed.
          pollingIntervalMs: 250
        }

        authClient = new AuthClient(authConfig)
      })

      it('I can request an access token to sign a transaction', async () => {
        const result = await authClient.requestAccessToken(signTransaction)

        expect(result).toEqual({
          token: expect.any(String)
        })
      })

      it('I can evaluate a sign transaction authorization request to get an access token', async () => {
        const authorization = await authClient.evaluate(signTransaction)

        expect(authorization.status).not.toEqual(AuthorizationResponseDtoStatusEnum.Created)
        expect(authorization.status).not.toEqual(AuthorizationResponseDtoStatusEnum.Processing)
        expect(authorization.evaluations[0].decision).toEqual(Decision.PERMIT)
      })
    })
  })
})
