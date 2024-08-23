/* eslint-disable jest/consistent-test-it */
import { Action, Entities, FIXTURE, Policy, Request, ValueOperators } from '@narval/policy-engine-shared'
import { privateKeyToJwk } from '@narval/signature'
import { generatePrivateKey, privateKeyToAddress } from 'viem/accounts'
import { armoryClient, getArmoryConfig, setInitialState, userClient } from '../util/setup'

const TEST_TIMEOUT_MS = 30_000

jest.setTimeout(TEST_TIMEOUT_MS)

const memberHexPk = generatePrivateKey()
const memberPrivateKey = privateKeyToJwk(memberHexPk)
const memberAddress = privateKeyToAddress(memberHexPk)

const adminHexPk = generatePrivateKey()
const adminPrivateKey = privateKeyToJwk(adminHexPk)
const adminAddress = privateKeyToAddress(adminHexPk)

const systemManagerHexPk = generatePrivateKey()
const systemManagerPrivateKey = privateKeyToJwk(systemManagerHexPk)
const systemManagerAddress = privateKeyToAddress(systemManagerHexPk)

const getAuthHost = () => 'http://localhost:3005'
const getAuthAdminApiKey = () => 'armory-admin-api-key'
const getVaultHost = () => 'http://localhost:3011'
const getVaultAdminApiKey = () => 'vault-admin-api-key'

describe('End to end scenarios', () => {
  describe('rate limiting', () => {
    const bobUserId = 'test-bob-user-uid'
    const aliceUserId = 'test-alice-user-uid'
    const bobPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Bob
    const alicePrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Alice

    let authClientId: string
    let vaultClientId: string

    const request: Request = {
      action: Action.SIGN_TRANSACTION,
      nonce: 'test-nonce',
      transactionRequest: {
        from: '0x0301e2724a40E934Cce3345928b88956901aA127',
        to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
        value: '0xde0b6b3a7640000',
        chainId: 1
      },
      resourceId: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127'
    }
    beforeAll(async () => {
      const config = await getArmoryConfig(systemManagerHexPk, {
        authHost: getAuthHost(),
        vaultHost: getVaultHost(),
        vaultAdminApiKey: getVaultAdminApiKey(),
        authAdminApiKey: getAuthAdminApiKey()
      })

      const { vault, auth } = config
      vaultClientId = vault.clientId
      authClientId = auth.clientId

      const { entityStoreClient, policyStoreClient, authClient, vaultClient } = armoryClient(config)
      const entities: Entities = {
        addressBook: [
          {
            id: 'eip155:1:0x9f38879167acCf7401351027EE3f9247A71cd0c5',
            address: '0x9f38879167acCf7401351027EE3f9247A71cd0c5',
            chainId: 1,
            classification: 'internal'
          },
          {
            id: 'eip155:1:0x0f610AC9F0091f8F573c33f15155afE8aD747495',
            address: '0x0f610AC9F0091f8F573c33f15155afE8aD747495',
            chainId: 1,
            classification: 'counterparty'
          }
        ],
        credentials: [
          {
            userId: 'test-alice-user-uid',
            id: '0x4fca4ebdd44d54a470a273cb6c131303892cb754f0d374a860fab7936bb95d94',
            key: {
              kty: 'EC',
              alg: 'ES256K',
              kid: '0x4fca4ebdd44d54a470a273cb6c131303892cb754f0d374a860fab7936bb95d94',
              crv: 'secp256k1',
              x: 'zb-LwlHDtp5sV8E33k3H2TCm-LNTGIcFjODNWI4gHRY',
              y: '6Pbt6dwxAeS7yHp7YV2GbXs_Px0tWrTfeTv9erjC7zs'
            }
          },
          {
            userId: 'test-bob-user-uid',
            id: '0x7e431d5b570ba38e2e036387a596219ae9076e8a488a6149b491892b03582166',
            key: {
              kty: 'EC',
              crv: 'secp256k1',
              alg: 'ES256K',
              kid: '0x7e431d5b570ba38e2e036387a596219ae9076e8a488a6149b491892b03582166',
              x: 'm5zj9v8I_UvB-15y7t7RmQXmyNmPuvAQPDdU71LRkUA',
              y: 'Az5R7PGJbmKdPpK2-jmUh7xyuaOZlCIFNU4I83xy5lU'
            }
          }
        ],
        tokens: [],
        userGroupMembers: [],
        userGroups: [],
        userAccounts: [],
        users: [
          {
            id: 'test-alice-user-uid',
            role: 'admin'
          },
          {
            id: 'test-bob-user-uid',
            role: 'member'
          }
        ],
        accountGroupMembers: [],
        accountGroups: [],
        accounts: [
          {
            id: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127',
            address: '0x0301e2724a40e934cce3345928b88956901aa127',
            accountType: 'eoa'
          },
          {
            id: 'eip155:eoa:0x76d1b7f9b3f69c435eef76a98a415332084a856f',
            address: '0x76d1b7f9b3f69c435eef76a98a415332084a856f',
            accountType: 'eoa'
          }
        ]
      }
      const policies: Policy[] = [
        {
          id: '1-admin-can-do-anything',
          description: 'admin can do any action',
          when: [
            {
              criterion: 'checkPrincipalRole',
              args: ['admin']
            }
          ],
          then: 'permit'
        },
        {
          id: '1-allow-2-transfer-per-day',
          description: 'Permit members to transfer native 2 times per day',
          when: [
            {
              criterion: 'checkRateLimit',
              args: { limit: 2, timeWindow: { type: 'fixed', period: '1d' } }
            },
            {
              criterion: 'checkIntentType',
              args: ['transferNative']
            },
            {
              criterion: 'checkPrincipalRole',
              args: ['member']
            }
          ],
          then: 'permit'
        }
      ]

      setInitialState({ entityStoreClient, policyStoreClient, entities, policies })
    })
    it('permits member bob to do a first transfer', async () => {
      // First transfer
      const { authClient, vaultClient } = await userClient(bobPrivateKey, {
        authHost: getAuthHost(),
        vaultHost: getVaultHost(),
        vaultClientId,
        authClientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits member bob to do a second transfer', async () => {
      // Second transfer
      const { authClient, vaultClient } = await userClient(bobPrivateKey, {
        authHost: getAuthHost(),
        vaultHost: getVaultHost(),
        vaultClientId,
        authClientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('forbids member bob to do a third transfer', async () => {
      // Third transfer
      const { authClient, vaultClient } = await userClient(bobPrivateKey, {
        authHost: getAuthHost(),
        vaultHost: getVaultHost(),
        vaultClientId,
        authClientId
      })

      try {
        await authClient.requestAccessToken(request)
      } catch (error: any) {
        expect(error.message).toEqual('Unauthorized')
      }
    })

    it('permits admin alice to do a transfer', async () => {
      const { authClient, vaultClient } = await userClient(alicePrivateKey, {
        authHost: getAuthHost(),
        vaultHost: getVaultHost(),
        vaultClientId,
        authClientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })
  })

  describe('spending limits', () => {
    const bobUserId = 'test-bob-user-uid'
    const aliceUserId = 'test-alice-user-uid'
    const bobPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Bob
    const alicePrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Alice

    let authClientId: string
    let vaultClientId: string

    const request: Request = {
      action: Action.SIGN_TRANSACTION,
      nonce: 'test-nonce',
      transactionRequest: {
        from: '0x0301e2724a40E934Cce3345928b88956901aA127',
        to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
        value: '0x429D069189E0000', // 0.3 ETH
        chainId: 1
      },
      resourceId: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127'
    }

    beforeAll(async () => {
      const config = await getArmoryConfig(systemManagerHexPk, {
        authHost: getAuthHost(),
        vaultHost: getVaultHost(),
        vaultAdminApiKey: getVaultAdminApiKey(),
        authAdminApiKey: getAuthAdminApiKey()
      })

      const { vault, auth } = config
      vaultClientId = vault.clientId
      authClientId = auth.clientId

      const { entityStoreClient, policyStoreClient } = armoryClient(config)
      const entities: Entities = {
        addressBook: [
          {
            id: 'eip155:1:0x9f38879167acCf7401351027EE3f9247A71cd0c5',
            address: '0x9f38879167acCf7401351027EE3f9247A71cd0c5',
            chainId: 1,
            classification: 'internal'
          },
          {
            id: 'eip155:1:0x0f610AC9F0091f8F573c33f15155afE8aD747495',
            address: '0x0f610AC9F0091f8F573c33f15155afE8aD747495',
            chainId: 1,
            classification: 'counterparty'
          }
        ],
        credentials: [
          {
            userId: 'test-alice-user-uid',
            id: '0x4fca4ebdd44d54a470a273cb6c131303892cb754f0d374a860fab7936bb95d94',
            key: {
              kty: 'EC',
              alg: 'ES256K',
              kid: '0x4fca4ebdd44d54a470a273cb6c131303892cb754f0d374a860fab7936bb95d94',
              crv: 'secp256k1',
              x: 'zb-LwlHDtp5sV8E33k3H2TCm-LNTGIcFjODNWI4gHRY',
              y: '6Pbt6dwxAeS7yHp7YV2GbXs_Px0tWrTfeTv9erjC7zs'
            }
          },
          {
            userId: 'test-bob-user-uid',
            id: '0x7e431d5b570ba38e2e036387a596219ae9076e8a488a6149b491892b03582166',
            key: {
              kty: 'EC',
              crv: 'secp256k1',
              alg: 'ES256K',
              kid: '0x7e431d5b570ba38e2e036387a596219ae9076e8a488a6149b491892b03582166',
              x: 'm5zj9v8I_UvB-15y7t7RmQXmyNmPuvAQPDdU71LRkUA',
              y: 'Az5R7PGJbmKdPpK2-jmUh7xyuaOZlCIFNU4I83xy5lU'
            }
          }
        ],
        tokens: [],
        userGroupMembers: [],
        userGroups: [],
        userAccounts: [],
        users: [
          {
            id: 'test-alice-user-uid',
            role: 'admin'
          },
          {
            id: 'test-bob-user-uid',
            role: 'member'
          }
        ],
        accountGroupMembers: [],
        accountGroups: [],
        accounts: [
          {
            id: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127',
            address: '0x0301e2724a40e934cce3345928b88956901aa127',
            accountType: 'eoa'
          },
          {
            id: 'eip155:eoa:0x76d1b7f9b3f69c435eef76a98a415332084a856f',
            address: '0x76d1b7f9b3f69c435eef76a98a415332084a856f',
            accountType: 'eoa'
          }
        ]
      }
      const policies: Policy[] = [
        {
          id: '1-admin-can-do-anything',
          description: 'admin can do any action',
          when: [
            {
              criterion: 'checkPrincipalRole',
              args: ['admin']
            }
          ],
          then: 'permit'
        },
        {
          id: 'member-can-transfer-1-eth',
          description: 'member can transfer 1 ETH',
          when: [
            {
              criterion: 'checkAction',
              args: ['signTransaction']
            },
            {
              criterion: 'checkIntentType',
              args: ['transferNative']
            },
            {
              criterion: 'checkIntentToken',
              args: ['eip155:1/slip44:60']
            },
            {
              criterion: 'checkSpendingLimit',
              args: {
                limit: '1000000000000000000',
                operator: 'lte' as ValueOperators,
                timeWindow: {
                  type: 'rolling',
                  value: 86400
                },
                filters: {
                  perPrincipal: true,
                  tokens: ['eip155:1/slip44:60']
                }
              }
            }
          ],
          then: 'permit'
        }
      ]
      setInitialState({ entityStoreClient, policyStoreClient, entities, policies })
    })

    it('permits member bob to do a transfer', async () => {
      const { authClient } = await userClient(bobPrivateKey, {
        authHost: getAuthHost(),
        vaultHost: getVaultHost(),
        vaultClientId,
        authClientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })
    it('permits member bob to do a second transfer', async () => {
      const { authClient } = await userClient(bobPrivateKey, {
        authHost: getAuthHost(),
        vaultHost: getVaultHost(),
        vaultClientId,
        authClientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })
    it('permits member bob to do a third transfer', async () => {
      const { authClient } = await userClient(bobPrivateKey, {
        authHost: getAuthHost(),
        vaultHost: getVaultHost(),
        vaultClientId,
        authClientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })
    it('forbids member bob to exceed the limit', async () => {
      const { authClient } = await userClient(bobPrivateKey, {
        authHost: getAuthHost(),
        vaultHost: getVaultHost(),
        vaultClientId,
        authClientId
      })

      try {
        await authClient.requestAccessToken(request)
      } catch (error: any) {
        expect(error.message).toEqual('Unauthorized')
      }
    })

    it('permits admin alice to do a transfer', async () => {
      const { authClient } = await userClient(alicePrivateKey, {
        authHost: getAuthHost(),
        vaultHost: getVaultHost(),
        vaultClientId,
        authClientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })
  })
})
