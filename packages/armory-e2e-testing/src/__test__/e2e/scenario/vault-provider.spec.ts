import { ClientDto, VaultAdminClient, VaultClient } from '@narval/armory-sdk'
import {
  Alg,
  Ed25519PrivateKey,
  Ed25519PublicKey,
  buildSignerForAlg,
  generateJwk,
  getPublicKey
} from '@narval/signature'
import { InitiateConnectionDtoProviderEnum } from 'packages/armory-sdk/src/lib/http/client/vault/api'
import { v4 as uuid } from 'uuid'

const TEST_TIMEOUT_MS = 30_000

jest.setTimeout(TEST_TIMEOUT_MS)

let userPrivateKey: Ed25519PrivateKey
let userPublicKey: Ed25519PublicKey

const VAULT_HOST_URL = 'http://localhost:3011'

const VAULT_ADMIN_API_KEY = 'vault-admin-api-key'

// IMPORTANT: The order of tests matters.
// These tests are meant to be run in series, not in parallel, because they
// represent an end-to-end user journey.
describe('User Journeys', () => {
  let clientVault: ClientDto
  const clientId = uuid()

  beforeAll(async () => {
    userPrivateKey = await generateJwk(Alg.EDDSA)
    userPublicKey = getPublicKey(userPrivateKey)
  })

  describe('As an admin', () => {
    const vaultAdminClient = new VaultAdminClient({
      host: VAULT_HOST_URL,
      adminApiKey: VAULT_ADMIN_API_KEY
    })

    it('I can create a new client in the vault', async () => {
      clientVault = await vaultAdminClient.createClient({
        clientId,
        name: `provider-e2e-testing-${clientId}`,
        baseUrl: VAULT_HOST_URL,
        auth: {
          local: {
            jwsd: {
              maxAge: 300,
              requiredComponents: ['htm', 'uri', 'created', 'ath']
            },
            allowedUsers: [
              {
                userId: 'provider-e2e-testing-user-123',
                publicKey: userPublicKey
              }
            ]
          },
          tokenValidation: {
            disabled: true
          }
        }
      })

      expect(clientVault).toEqual({
        clientId,
        name: expect.any(String),
        backupPublicKey: null,
        baseUrl: VAULT_HOST_URL,
        configurationSource: 'dynamic',
        auth: {
          disabled: false,
          local: {
            jwsd: {
              maxAge: 300,
              requiredComponents: ['htm', 'uri', 'created', 'ath']
            },
            allowedUsersJwksUrl: null,
            allowedUsers: [
              {
                userId: 'provider-e2e-testing-user-123',
                publicKey: userPublicKey
              }
            ]
          },
          tokenValidation: {
            disabled: true,
            url: null,
            jwksUrl: null,
            pinnedPublicKey: null,
            verification: {
              audience: null,
              issuer: null,
              maxTokenAge: null,
              requireBoundTokens: true,
              allowBearerTokens: false,
              allowWildcard: null
            }
          }
        },
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      })
    })
  })

  describe('As a client', () => {
    let vaultClient: VaultClient

    beforeAll(async () => {
      vaultClient = new VaultClient({
        host: VAULT_HOST_URL,
        clientId,
        signer: {
          jwk: userPublicKey,
          alg: userPrivateKey.alg,
          sign: await buildSignerForAlg(userPrivateKey)
        }
      })
    })

    describe('I want to interact with the vault', () => {
      it('I can generate an encryption key', async () => {
        const encryptionKey = await vaultClient.generateEncryptionKey()

        expect(encryptionKey.alg).toEqual('RS256')
        expect(encryptionKey.kty).toEqual('RSA')
        expect(encryptionKey.use).toEqual('enc')
      })

      it('I can list connections', async () => {
        const connections = await vaultClient.listConnections()

        expect(connections).toEqual({
          data: [],
          page: { next: null }
        })
      })

      it('I can initiate a connection', async () => {
        const connection = await vaultClient.initiateConnection({
          data: {
            provider: InitiateConnectionDtoProviderEnum.Anchorage
          }
        })

        expect(connection.data.connectionId).toBeDefined()
      })
    })
  })
})
