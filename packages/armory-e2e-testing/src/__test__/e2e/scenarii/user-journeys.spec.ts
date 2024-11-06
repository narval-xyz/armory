/* eslint-disable jest/consistent-test-it */
import {
  AuthAdminClient,
  AuthClient,
  AuthorizationResponseDtoStatusEnum,
  ClientDto,
  CreateClientResponseDto,
  DataStoreConfig,
  EntityStoreClient,
  Permission,
  PolicyStoreClient,
  SignOptions,
  Signer,
  VaultAdminClient,
  VaultClient,
  WalletDto,
  createHttpDataStore,
  credential,
  resourceId
} from '@narval/armory-sdk'
import {
  AccessToken,
  AccountEntity,
  AccountType,
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

const TEST_TIMEOUT_MS = 30_000

jest.setTimeout(TEST_TIMEOUT_MS)

const userPrivateKey = privateKeyToJwk(generatePrivateKey())

const userPublicKey = getPublicKey(userPrivateKey)

const dataStorePrivateKey = privateKeyToJwk(generatePrivateKey())

const getAuthHost = () => 'http://localhost:3005'

const getAuthAdminApiKey = () => 'armory-admin-api-key'

const getVaultHost = () => 'http://localhost:3011'

const getVaultAdminApiKey = () => 'vault-admin-api-key'

const getExpectedSignature = (input: { data: unknown; signer?: Signer; clientId: string } & SignOptions) => {
  const { data, signer, clientId, issuedAt } = input

  if (signer) {
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

  throw new Error('Missing signer')
}

// IMPORTANT: The order of tests matters.
// These tests are meant to be run in series, not in parallel, because they
// represent an end-to-end user journey.
describe('User Journeys', () => {
  let clientAuth: CreateClientResponseDto
  let clientVault: ClientDto

  const accountPrivateKey = generatePrivateKey()

  const viemAccount = privateKeyToAccount(accountPrivateKey)

  const account: AccountEntity = {
    id: resourceId(viemAccount.address),
    address: viemAccount.address,
    accountType: AccountType.EOA
  }

  const clientId = uuid()

  const user: UserEntity = {
    id: uuid(),
    role: UserRole.ADMIN
  }

  const entities: Partial<Entities> = {
    users: [user],
    credentials: [credential(user, userPublicKey)],
    accounts: [account]
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

  const signTransaction: Omit<CreateAuthorizationRequest, 'authentication'> = {
    approvals: [],
    clientId,
    id: uuid(),
    request: {
      action: Action.SIGN_TRANSACTION,
      nonce: uuid(),
      resourceId: account.id,
      transactionRequest: {
        chainId: 1,
        data: '0x',
        from: account.address,
        // It's crucial to test an E2E flow that includes a bigint value.
        // This is because we convert it into a string before transmitting
        // it, and decode it on the server side. A discrepancy between the
        // SDK and server types can result in an invalid hash.
        gas: 5000n,
        nonce: 0,
        to: '0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23',
        type: '2'
      }
    }
  }

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
          entityPublicKeys: [publicKey],
          policyDataUrl: expect.any(String),
          policyPublicKeys: [publicKey]
        },
        policyEngine: {
          nodes: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              clientId: clientId,
              publicKey: expect.any(Object),
              url: expect.any(String)
            })
          ])
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
          data: fullEntities,
          signature: expect.any(String)
        })
      })

      // TODO: (@wcalderipe, 25/06/24) The operation will fail at this step
      // because it always syncs both the entity and policy stores. This
      // results in a schema validation error for the policy store that is not
      // configured. The result must be true. This is sync design issue.
      test('I can trigger a data store sync', async () => {
        const result = await entityStoreClient.sync()

        expect(result).toEqual(false)
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
          data: policies,
          signature: expect.any(String)
        })
      })

      test('I can trigger a data store sync', async () => {
        const result = await policyStoreClient.sync()

        expect(result).toEqual(true)
      })
    })

    describe('I want to request an access token', () => {
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
        const actualAccount = await vaultClient.importAccount({
          data: {
            privateKey: accountPrivateKey
          },
          encryptionKey,
          accessToken
        })

        expect(actualAccount).toEqual({
          id: account.id,
          address: account.address,
          publicKey: viemAccount.publicKey,
          origin: 'IMPORTED'
        })
      })

      test('I can sign a transaction request', async () => {
        const signTransactionAccessToken = await authClient.requestAccessToken(signTransaction.request)

        const result = await vaultClient.sign({
          data: signTransaction.request,
          accessToken: signTransactionAccessToken
        })

        expect(result).toEqual({
          signature: expect.any(String)
        })
      })
    })
  })
})
