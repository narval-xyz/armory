/* eslint-disable no-console */
import {
  Action,
  AuthAdminClient,
  AuthClient,
  Criterion,
  Entities,
  EntityStoreClient,
  EntityUtil,
  Permission,
  Policy,
  PolicyStoreClient,
  Then,
  UserEntity,
  UserRole,
  VaultAdminClient,
  VaultClient,
  createHttpDataStore,
  credential,
  resourceId
} from '@narval/armory-sdk'
import {
  AccountEntity,
  AccountType,
  ConfirmationClaimProofMethod,
  SignTransactionAction
} from '@narval/policy-engine-shared'
import { Ed25519PrivateKey, buildSignerForAlg, getPublicKey, hash, signJwt } from '@narval/signature'
import { AxiosError } from 'axios'
import { randomUUID } from 'crypto'
import { format } from 'date-fns'
import { v4 as uuid } from 'uuid'
import { Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const ACCOUNT_PRIVATE_KEY: Hex = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

const TEST_TIMEOUT_MS = 30_000

jest.setTimeout(TEST_TIMEOUT_MS)

const getAuthHost = () => 'http://localhost:3005'

const getAuthAdminApiKey = () => 'armory-admin-api-key'

const getVaultHost = () => 'http://localhost:3011'

const getVaultAdminApiKey = () => 'vault-admin-api-key'

// IMPORTANT: The order of tests matters.
// These tests are meant to be run in series, not in parallel, because they
// represent an end-to-end user journey.
describe('User Journeys', () => {
  let ephemeralPrivateKey: Ed25519PrivateKey
  let dataStorePrivateKey: Ed25519PrivateKey
  let appPrivateKey: Ed25519PrivateKey
  let authClient: AuthClient
  let vaultClient: VaultClient

  const clientId = uuid()

  const setup = async () => {
    try {
      const authAdminClient = new AuthAdminClient({
        host: getAuthHost(),
        adminApiKey: getAuthAdminApiKey()
      })

      const vaultAdminClient = new VaultAdminClient({
        host: getVaultHost(),
        adminApiKey: getVaultAdminApiKey()
      })

      const vaultClient = new VaultClient({
        host: getVaultHost(),
        clientId,
        signer: {
          jwk: getPublicKey(ephemeralPrivateKey),
          alg: ephemeralPrivateKey.alg,
          sign: await buildSignerForAlg(ephemeralPrivateKey)
        }
      })

      const authClient = new AuthClient({
        host: getAuthHost(),
        clientId,
        signer: {
          jwk: getPublicKey(appPrivateKey),
          alg: appPrivateKey.alg,
          sign: await buildSignerForAlg(appPrivateKey)
        },
        pollingTimeoutMs: TEST_TIMEOUT_MS - 10_000,
        // In a local AS and PE, 250 ms is equivalent to ~3 requests until
        // the job is processed.
        pollingIntervalMs: 250
      })

      const clientAuth = await authAdminClient.createClient({
        id: clientId,
        name: `Bind Access Token E2E Test ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`,
        dataStore: createHttpDataStore({
          host: getAuthHost(),
          clientId,
          keys: [getPublicKey(dataStorePrivateKey)]
        }),
        useManagedDataStore: true
      })

      await vaultAdminClient.createClient({
        clientId,
        name: `provider-e2e-testing-${clientId}`,
        baseUrl: getVaultHost(),
        auth: {
          local: {
            jwsd: {
              maxAge: 300,
              requiredComponents: ['htm', 'uri', 'created', 'ath']
            }
          },
          tokenValidation: {
            disabled: false,
            url: null,
            // IMPORTANT: Pin the policy engine's public key in the token
            // validation.
            pinnedPublicKey: clientAuth.policyEngine.nodes[0].publicKey,
            verification: {
              audience: null,
              issuer: 'https://armory.narval.xyz',
              maxTokenAge: 300,
              // IMPORTANT: It must be set to true
              requireBoundTokens: true,
              // IMPORTANT: It does not need bearer token
              allowBearerTokens: false
            }
          }
        }
      })

      const viemAccount = privateKeyToAccount(ACCOUNT_PRIVATE_KEY)

      const account: AccountEntity = {
        id: resourceId(viemAccount.address),
        address: viemAccount.address,
        accountType: AccountType.EOA
      }

      const appUser: UserEntity = {
        id: uuid(),
        role: UserRole.ADMIN
      }

      const entities: Entities = {
        ...EntityUtil.empty(),
        users: [appUser],
        credentials: [credential(appUser, getPublicKey(appPrivateKey))],
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

      const entityStoreClient = new EntityStoreClient({
        host: getAuthHost(),
        clientId: clientAuth.id,
        clientSecret: clientAuth.clientSecret,
        signer: {
          jwk: dataStorePrivateKey,
          alg: dataStorePrivateKey.alg,
          sign: await buildSignerForAlg(dataStorePrivateKey)
        }
      })

      await entityStoreClient.signAndPush(entities)

      const policyStoreClient = new PolicyStoreClient({
        host: getAuthHost(),
        clientId: clientAuth.id,
        clientSecret: clientAuth.clientSecret,
        signer: {
          jwk: dataStorePrivateKey,
          alg: dataStorePrivateKey.alg,
          sign: await buildSignerForAlg(dataStorePrivateKey)
        }
      })

      await policyStoreClient.signAndPush(policies)

      return {
        vaultClient,
        authClient
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.dir(
          {
            url: error.config?.url,
            status: error.response?.status,
            body: error.response?.data
          },
          { depth: null }
        )
      }

      throw error
    }
  }

  beforeAll(async () => {
    // Pin the keys because it's easier to debug a known value.
    ephemeralPrivateKey = {
      kty: 'OKP',
      crv: 'Ed25519',
      alg: 'EDDSA',
      kid: '0x65a3f312d1fc34e937ca9c1b7fbe5b9f98fb15e2cb15594ec6cd5167e36a58e3',
      x: 'n0AX7pAzBhCr6R7dRhPqeGDVIKRaatVjdmL3KX58HGw',
      d: 'tl8nZiFTRa5C_yJvL73KFnxDbuUi8h6bUvh28jvXmII'
    }

    dataStorePrivateKey = {
      kty: 'OKP',
      crv: 'Ed25519',
      alg: 'EDDSA',
      kid: '0xb97232aabc42dbf69f19379a66417f9488520a3d3062bd14932ffc61e6958755',
      x: '1e9Qy9e12g_HNNad-BxcgMWl7W7htIZ-M50Xr-RSFSM',
      d: 'XxsSP2a3notOyIBr4qWwQl-uNsUqrG8cCXDwLRVR08w'
    }

    appPrivateKey = {
      kty: 'OKP',
      crv: 'Ed25519',
      alg: 'EDDSA',
      kid: '0xffe1b0b211c314237b26cc5fc346445496a4b0ab65e5c007de46dfcdbf917ced',
      x: 'bqV752BughPmE8QWcHc3EQdfrzomMcr_1k2kaj6v3mY',
      d: '0ZIIuPFtY6iOuqlp7CcX4yyAIokJtLRqu43voyfyjZg'
    }

    const context = await setup()

    authClient = context.authClient
    vaultClient = context.vaultClient
  })

  it('I can issue a grant permission bound access token and use it', async () => {
    try {
      const request = {
        action: Action.GRANT_PERMISSION,
        resourceId: 'vault',
        nonce: randomUUID(),
        permissions: ['connection:write', 'connection:read']
      }

      const accessToken = await authClient.requestAccessToken(request, {
        metadata: {
          confirmation: {
            key: {
              jwk: getPublicKey(ephemeralPrivateKey),
              proof: ConfirmationClaimProofMethod.JWS,
              jws: await signJwt(
                {
                  requestHash: hash(request)
                },
                ephemeralPrivateKey
              )
            }
          }
        }
      })

      await expect(vaultClient.listConnections({ accessToken })).resolves.not.toThrow()
    } catch (error) {
      if (error instanceof AxiosError) {
        console.dir(
          {
            url: error.config?.url,
            status: error.response?.status,
            body: error.response?.data
          },
          { depth: null }
        )
      }

      throw error
    }
  })

  it('I can issue a bound access token and use it to sign transaction', async () => {
    try {
      //
      // SETUP
      //

      const grantPermissionRequest = {
        action: Action.GRANT_PERMISSION,
        resourceId: 'vault',
        nonce: randomUUID(),
        permissions: [Permission.WALLET_IMPORT, Permission.WALLET_CREATE]
      }

      const importAccountAccessToken = await authClient.requestAccessToken(grantPermissionRequest, {
        metadata: {
          confirmation: {
            key: {
              jwk: getPublicKey(ephemeralPrivateKey),
              proof: ConfirmationClaimProofMethod.JWS,
              jws: await signJwt(
                {
                  requestHash: hash(grantPermissionRequest)
                },
                ephemeralPrivateKey
              )
            }
          }
        }
      })

      const encryptionKey = await vaultClient.generateEncryptionKey({ accessToken: importAccountAccessToken })

      const account = await vaultClient.importAccount({
        data: {
          privateKey: ACCOUNT_PRIVATE_KEY
        },
        accessToken: importAccountAccessToken,
        encryptionKey
      })

      //
      // SIGN TRANSACTION
      //

      const signTxRequest: SignTransactionAction = {
        action: Action.SIGN_TRANSACTION,
        nonce: uuid(),
        resourceId: account.id,
        transactionRequest: {
          chainId: 1,
          data: '0x',
          from: account.address,
          gas: 5000n,
          nonce: 0,
          to: '0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23',
          type: '2'
        }
      }

      const signTxAccessToken = await authClient.requestAccessToken(signTxRequest, {
        metadata: {
          confirmation: {
            key: {
              jwk: getPublicKey(ephemeralPrivateKey),
              proof: ConfirmationClaimProofMethod.JWS,
              jws: await signJwt(
                {
                  requestHash: hash(signTxRequest)
                },
                ephemeralPrivateKey
              )
            }
          }
        }
      })

      const { signature } = await vaultClient.sign({
        data: signTxRequest,
        accessToken: signTxAccessToken
      })

      expect(signature).toEqual(expect.any(String))
    } catch (error) {
      if (error instanceof AxiosError) {
        console.dir(
          {
            url: error.config?.url,
            status: error.response?.status,
            body: error.response?.data
          },
          { depth: null }
        )
      }

      throw error
    }
  })
})
