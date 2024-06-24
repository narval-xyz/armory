/* eslint-disable jest/consistent-test-it */
import {
  AccessToken,
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
import {
  RsaPublicKey,
  SigningAlg,
  buildSignerForAlg,
  getPublicKey,
  hash,
  privateKeyToJwk,
  signJwt
} from '@narval/signature'
import { format } from 'date-fns'
import { v4 as uuid } from 'uuid'
import { english, generateMnemonic, generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { AuthAdminClient, AuthClient } from '../../auth/client'
import { EntityStoreClient, PolicyStoreClient } from '../../data-store/client'
import { DataStoreConfig } from '../../data-store/type'
import { createHttpDataStore, credential } from '../../data-store/util'
import { Permission } from '../../domain'
import { AuthorizationResponseDtoStatusEnum, CreateClientResponseDto } from '../../http/client/auth'
import { ClientDto, WalletDto } from '../../http/client/vault'
import { SignOptions, Signer } from '../../shared/type'
import { VaultAdminClient, VaultClient } from '../../vault/client'

const TEST_TIMEOUT_MS = 30_000

jest.setTimeout(TEST_TIMEOUT_MS)

const userPrivateKey = privateKeyToJwk(generatePrivateKey())

const userPublicKey = getPublicKey(userPrivateKey)

const dataStorePrivateKey = privateKeyToJwk(generatePrivateKey())

const getAuthHost = () => 'http://localhost:3005'

const getAuthAdminApiKey = () => '2cfa9d09a28f1de9108d18c38f5d5304e6708744c7d7194cbc754aef3455edc7e9270e2f28f052622257'

const getVaultHost = () => 'http://localhost:3011'

const getVaultAdminApiKey = () => 'b8795927715a31131072b3b6490f9705d56895aa2d1f89d9bdd39b1c815cb3dfe71e5f72c6ef174f00ca'

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
  let clientAuth: CreateClientResponseDto
  let clientVault: ClientDto

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
      description: 'Allows admin to do anything',
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
    let vaultAdminClient: VaultAdminClient

    beforeEach(async () => {
      authAdminClient = new AuthAdminClient({
        host: getAuthHost(),
        adminApiKey: getAuthAdminApiKey()
      })

      vaultAdminClient = new VaultAdminClient({
        host: getVaultHost(),
        adminApiKey: getVaultAdminApiKey()
      })
    })

    test('I can create a new client in the authorization server', async () => {
      const publicKey = getPublicKey(dataStorePrivateKey)

      clientAuth = await authAdminClient.createClient({
        id: clientId,
        name: `Armory SDK E2E test ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`,
        dataStore: createHttpDataStore({
          host: getAuthHost(),
          clientId,
          keys: [publicKey]
        }),
        useManagedDataStore: true
      })

      expect(clientAuth).toMatchObject({
        id: clientId,
        name: expect.any(String),
        clientSecret: expect.any(String),
        dataSecret: null,
        dataStore: {
          entityDataUrl: expect.any(String),
          entityPublicKey: publicKey,
          policyDataUrl: expect.any(String),
          policyPublicKey: publicKey
        },
        policyEngine: {
          nodes: [
            {
              id: expect.any(String),
              clientId: clientId,
              publicKey: expect.any(Object),
              url: expect.any(String)
            }
          ]
        },
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })

    test('I can create a new client in the vault', async () => {
      clientVault = await vaultAdminClient.createClient({
        clientId: clientAuth.id,
        engineJwk: clientAuth.policyEngine.nodes[0].publicKey
      })

      expect(clientVault).toEqual({
        clientId: clientAuth.id,
        engineJwk: clientAuth.policyEngine.nodes[0].publicKey,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })
  })

  describe('As a client', () => {
    let vaultClient: VaultClient
    let authClient: AuthClient

    beforeEach(async () => {
      authClient = new AuthClient({
        host: getAuthHost(),
        clientId,
        signer: {
          jwk: userPrivateKey,
          alg: SigningAlg.ES256K,
          sign: await buildSignerForAlg(userPrivateKey)
        },
        pollingTimeoutMs: TEST_TIMEOUT_MS - 10_000,
        // In a local AS and PE, 250 ms is equivalent to ~3 requests until
        // the job is processed.
        pollingIntervalMs: 250
      })

      vaultClient = new VaultClient({
        host: getVaultHost(),
        clientId,
        signer: {
          jwk: userPrivateKey,
          alg: userPrivateKey.alg,
          sign: await buildSignerForAlg(userPrivateKey)
        }
      })
    })

    describe('I want to set up my entity data store', () => {
      let dataStoreConfig: DataStoreConfig
      let entityStoreClient: EntityStoreClient

      const fullEntities: Entities = { ...EntityUtil.empty(), ...entities }

      beforeEach(async () => {
        dataStoreConfig = {
          host: getAuthHost(),
          clientId: clientAuth.id,
          clientSecret: clientAuth.clientSecret,
          signer: {
            jwk: dataStorePrivateKey,
            alg: SigningAlg.ES256K,
            sign: await buildSignerForAlg(dataStorePrivateKey)
          }
        }
        entityStoreClient = new EntityStoreClient(dataStoreConfig)
      })

      test('I can sign a partial entities object', async () => {
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

      test('I can sign a complete entities object', async () => {
        const issuedAt = new Date()

        const signature = await entityStoreClient.sign(fullEntities, { issuedAt })

        const expectedSignature = await getExpectedSignature({
          data: fullEntities,
          issuedAt,
          ...dataStoreConfig
        })

        expect(signature).toEqual(expectedSignature)
      })

      test('I can push entities and signature to a managed data store', async () => {
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

      test('I can sign and push entities and signature to a managed data store', async () => {
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

      test('I can fetch the latest version of the data store', async () => {
        const actualEntities = await entityStoreClient.fetch()

        expect(actualEntities).toEqual({
          entity: {
            data: fullEntities,
            signature: expect.any(String)
          }
        })
      })

      test('I can trigger a data store sync', async () => {
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
          clientId: clientAuth.id,
          clientSecret: clientAuth.clientSecret,
          signer: {
            jwk: dataStorePrivateKey,
            alg: SigningAlg.ES256K,
            sign: await buildSignerForAlg(dataStorePrivateKey)
          }
        }
        policyStoreClient = new PolicyStoreClient(dataStoreConfig)
      })

      test('I can sign policies', async () => {
        const issuedAt = new Date()

        const signature = await policyStoreClient.sign(policies, { issuedAt })

        const expectedSignature = await getExpectedSignature({
          data: policies,
          issuedAt,
          ...dataStoreConfig
        })

        expect(signature).toEqual(expectedSignature)
      })

      test('I can push policies and signature to a managed data store', async () => {
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

      test('I can sign and push policies and signature to a managed data store', async () => {
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

      test('I can fetch the latest version of the data store', async () => {
        const actualPolicies = await policyStoreClient.fetch()

        expect(actualPolicies).toEqual({
          policy: {
            data: policies,
            signature: expect.any(String)
          }
        })
      })

      test('I can trigger a data store sync', async () => {
        const result = await policyStoreClient.sync()

        expect(result).toEqual(true)
      })
    })

    describe('I want to request an access token', () => {
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

      test('I can request an access token to sign a transaction', async () => {
        const accessToken = await authClient.requestAccessToken(signTransaction.request, {
          // Options
          id: uuid(),
          approvals: []
        })

        expect(accessToken).toEqual({
          value: expect.any(String)
        })
      })

      test('I can evaluate a sign transaction authorization request to get an access token', async () => {
        const authorization = await authClient.evaluate(signTransaction)

        expect(authorization.status).not.toEqual(AuthorizationResponseDtoStatusEnum.Created)
        expect(authorization.status).not.toEqual(AuthorizationResponseDtoStatusEnum.Processing)
        expect(authorization.evaluations[0].decision).toEqual(Decision.PERMIT)
      })
    })

    describe('I want to interact with the vault', () => {
      let accessToken: AccessToken
      let encryptionKey: RsaPublicKey
      let wallet: WalletDto

      const mnemonic = generateMnemonic(english)

      beforeAll(async () => {
        accessToken = await authClient.requestAccessToken({
          action: Action.GRANT_PERMISSION,
          resourceId: 'vault',
          nonce: uuid(),
          permissions: [Permission.WALLET_IMPORT, Permission.WALLET_CREATE, Permission.WALLET_READ]
        })
      })

      test('I can generate an encryption key', async () => {
        encryptionKey = await vaultClient.generateEncryptionKey({ accessToken })

        expect(encryptionKey.alg).toEqual('RS256')
        expect(encryptionKey.kty).toEqual('RSA')
        expect(encryptionKey.use).toEqual('enc')
      })

      test('I can generate a wallet', async () => {
        wallet = await vaultClient.generateWallet({ accessToken })

        expect(wallet.keyId).toEqual(expect.any(String))
        expect(wallet.account.derivationPath).toEqual("m/44'/60'/0'/0/0")
      })

      test('I can import a wallet', async () => {
        const importedWallet = await vaultClient.importWallet({
          data: {
            seed: mnemonic
          },
          encryptionKey,
          accessToken
        })

        expect(importedWallet.keyId).toEqual(expect.any(String))
        expect(importedWallet.account.derivationPath).toEqual("m/44'/60'/0'/0/0")
      })

      test('I can list wallets', async () => {
        const { wallets } = await vaultClient.listWallets({ accessToken })

        expect(wallets).toMatchObject([
          {
            origin: 'GENERATED'
          },
          {
            origin: 'IMPORTED'
          }
        ])
      })

      test('I can derive an account from a wallet', async () => {
        const { accounts } = await vaultClient.deriveAccounts({
          data: {
            keyId: wallet.keyId,
            derivationPaths: ["m/44'/60'/0'/0/1", "m/44'/60'/0'/0/2"]
          },
          accessToken
        })

        expect(accounts).toMatchObject([
          {
            derivationPath: "m/44'/60'/0'/0/1",
            address: expect.any(String),
            id: expect.any(String),
            keyId: expect.any(String),
            publicKey: expect.any(String)
          },
          {
            derivationPath: "m/44'/60'/0'/0/2",
            address: expect.any(String),
            id: expect.any(String),
            keyId: expect.any(String),
            publicKey: expect.any(String)
          }
        ])
      })

      test('I can import an account', async () => {
        const privateKey = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'
        const account = privateKeyToAccount(privateKey)

        const actualAccount = await vaultClient.importAccount({
          data: {
            privateKey
          },
          encryptionKey,
          accessToken
        })

        expect(actualAccount).toEqual({
          id: `eip155:eoa:${account.address.toLowerCase()}`,
          address: account.address,
          publicKey: account.publicKey
        })
      })
    })
  })
})
