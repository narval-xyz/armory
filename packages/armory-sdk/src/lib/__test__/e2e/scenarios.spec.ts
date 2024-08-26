/* eslint-disable jest/consistent-test-it */
import {
  Action,
  Decision,
  Entities,
  EntityType,
  FIXTURE,
  Policy,
  Request,
  ValueOperators
} from '@narval/policy-engine-shared'
import { v4 } from 'uuid'
import { buildAuthClient, createClient, saveDataStore } from '../util/setup'

const TEST_TIMEOUT_MS = 30_000

jest.setTimeout(TEST_TIMEOUT_MS)

export const advanceTime = (hours: number): void => {
  jest.useFakeTimers()
  jest.setSystemTime(Date.now() + hours * 60 * 60 * 1000)
}

const systemManagerHexPk = FIXTURE.UNSAFE_PRIVATE_KEY.Root

const getAuthHost = () => 'http://localhost:3005'
const getAuthAdminApiKey = () => 'armory-admin-api-key'
const bobPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Bob
const alicePrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Alice
const carolPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Carol

describe('End to end scenarios', () => {
  describe('rate limiting by principal', () => {
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
    // Generate a new client ID for each test run, otherwise historical data with persist between tests if using a long-lived db.
    const clientId = v4()

    beforeAll(async () => {
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
              args: { limit: 2, timeWindow: { type: 'fixed', period: '1d' }, filters: { perPrincipal: true } }
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

      await createClient(systemManagerHexPk, {
        clientId,
        authHost: getAuthHost(),
        authAdminApiKey: getAuthAdminApiKey()
      })
      await saveDataStore(systemManagerHexPk, {
        clientId,
        host: getAuthHost(),
        entities,
        policies
      })
    })
    it('alice-admin does a transfer that is not counted against the rate limit', async () => {
      const { authClient } = await buildAuthClient(alicePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits member bob to do a first transfer', async () => {
      // First transfer
      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits member bob to do a second transfer', async () => {
      // Second transfer
      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('forbids member bob to do a third transfer', async () => {
      expect.assertions(1)
      // Third transfer
      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      try {
        await authClient.requestAccessToken(request)
      } catch (error: any) {
        expect(error.message).toEqual('Unauthorized')
      }
    })

    it('permits admin alice to do a transfer', async () => {
      const { authClient } = await buildAuthClient(alicePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })
  })

  describe('rate limiting by groupId', () => {
    const request: Request = {
      action: Action.SIGN_TRANSACTION,
      nonce: 'test-nonce',
      transactionRequest: {
        from: '0x0301e2724a40E934Cce3345928b88956901aA127',
        to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
        value: '0x58D15E176280000', // 0.4 ETH
        chainId: 1
      },
      resourceId: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127'
    }

    // Generate a new client ID for each test run, otherwise historical data with persist between tests if using a long-lived db.
    const clientId = v4()

    beforeAll(async () => {
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
          },
          {
            userId: 'test-carol-user-uid',
            id: '0x8014093787673513011ee2be28bc685a1df716abbe0d4d76173b0dbdc33d0557',
            key: {
              kty: 'EC',
              crv: 'secp256k1',
              alg: 'ES256K',
              kid: '0x8014093787673513011ee2be28bc685a1df716abbe0d4d76173b0dbdc33d0557',
              x: 'OA4p5YjB0XBUzMuE6qhSwcSCLDu-yf9VekwcE320fWw',
              y: 'nLK5Qr_VHqZD9rVCLMHToXvdE9KuTn6w--PJ9jcpdUU'
            }
          }
        ],
        tokens: [],
        userGroupMembers: [
          {
            groupId: 'treasury-group-id',
            userId: 'test-bob-user-uid'
          },
          {
            groupId: 'treasury-group-id',
            userId: 'test-carol-user-uid'
          }
        ],
        userGroups: [
          {
            id: 'treasury-group-id'
          }
        ],
        userAccounts: [],
        users: [
          {
            id: 'test-alice-user-uid',
            role: 'admin'
          },
          {
            id: 'test-bob-user-uid',
            role: 'member'
          },
          {
            id: 'test-carol-user-uid',
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
          id: 'treasury-members-can-transfer-1-eth',
          description: 'treasury group members can transfer 1 ETH',
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
                  userGroups: ['treasury-group-id'],
                  tokens: ['eip155:1/slip44:60']
                }
              }
            }
          ],
          then: 'permit'
        }
      ]

      await createClient(systemManagerHexPk, {
        clientId,
        authHost: getAuthHost(),
        authAdminApiKey: getAuthAdminApiKey()
      })
      await saveDataStore(systemManagerHexPk, {
        clientId,
        host: getAuthHost(),
        entities,
        policies
      })
    })

    it('alice-admin does a transfer that is not counted against the rate limit', async () => {
      const { authClient } = await buildAuthClient(alicePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits treasury-group member bob to do a transfer', async () => {
      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits treasury-group member carol to do a transfer', async () => {
      const { authClient } = await buildAuthClient(carolPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('forbids member bob to exceed the limit', async () => {
      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      try {
        await authClient.requestAccessToken(request)
      } catch (error: any) {
        expect(error.message).toEqual('Unauthorized')
      }
    })

    it('forbids member carol to exceed the limit', async () => {
      const { authClient } = await buildAuthClient(carolPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      try {
        await authClient.requestAccessToken(request)
      } catch (error: any) {
        expect(error.message).toEqual('Unauthorized')
      }
    })

    it('permits admin alice to do a transfer', async () => {
      const { authClient } = await buildAuthClient(alicePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })
  })

  describe('spending limits', () => {
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

    // Generate a new client ID for each test run, otherwise historical data with persist between tests if using a long-lived db.
    const clientId = v4()

    beforeAll(async () => {
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
              criterion: 'checkPrincipalRole',
              args: ['member']
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

      await createClient(systemManagerHexPk, {
        clientId,
        authHost: getAuthHost(),
        authAdminApiKey: getAuthAdminApiKey()
      })
      await saveDataStore(systemManagerHexPk, {
        clientId,
        host: getAuthHost(),
        entities,
        policies
      })
    })

    it('alice-admin does a transfer that is not counted against the rate limit', async () => {
      const { authClient } = await buildAuthClient(alicePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits member bob to do a transfer', async () => {
      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits member bob to do a second transfer', async () => {
      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits member bob to do a third transfer', async () => {
      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('forbids member bob to exceed the limit', async () => {
      expect.assertions(1)
      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      try {
        await authClient.requestAccessToken(request)
      } catch (error: any) {
        expect(error.message).toEqual('Unauthorized')
      }
    })

    it('permits admin alice to do a transfer', async () => {
      const { authClient } = await buildAuthClient(alicePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })
  })

  describe('approvals by groupId and spending limit', () => {
    const request: Request = {
      action: Action.SIGN_TRANSACTION,
      nonce: 'test-nonce',
      transactionRequest: {
        from: '0x0301e2724a40E934Cce3345928b88956901aA127',
        to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
        value: '0x58D15E176280000', // 0.4 ETH
        chainId: 1
      },
      resourceId: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127'
    }

    // Generate a new client ID for each test run, otherwise historical data with persist between tests if using a long-lived db.
    const clientId = v4()

    beforeAll(async () => {
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
          },
          {
            userId: 'test-carol-user-uid',
            id: '0x8014093787673513011ee2be28bc685a1df716abbe0d4d76173b0dbdc33d0557',
            key: {
              kty: 'EC',
              crv: 'secp256k1',
              alg: 'ES256K',
              kid: '0x8014093787673513011ee2be28bc685a1df716abbe0d4d76173b0dbdc33d0557',
              x: 'OA4p5YjB0XBUzMuE6qhSwcSCLDu-yf9VekwcE320fWw',
              y: 'nLK5Qr_VHqZD9rVCLMHToXvdE9KuTn6w--PJ9jcpdUU'
            }
          }
        ],
        tokens: [],
        userGroupMembers: [
          {
            groupId: 'treasury-group-id',
            userId: 'test-bob-user-uid'
          },
          {
            groupId: 'treasury-group-id',
            userId: 'test-carol-user-uid'
          }
        ],
        userGroups: [
          {
            id: 'treasury-group-id'
          }
        ],
        userAccounts: [],
        users: [
          {
            id: 'test-alice-user-uid',
            role: 'admin'
          },
          {
            id: 'test-bob-user-uid',
            role: 'member'
          },
          {
            id: 'test-carol-user-uid',
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
          id: 'treasury-members-can-transfer-1-eth',
          description: 'treasury group members can transfer 1 ETH',
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
              criterion: 'checkPrincipalGroup',
              args: ['treasury-group-id']
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
                  userGroups: ['treasury-group-id'],
                  tokens: ['eip155:1/slip44:60']
                }
              }
            }
          ],
          then: 'permit'
        },
        {
          id: 'treasury-members-can-transfer-gt-1-eth-per-day-with-approval',
          description: 'treasury group members transfers for more than 1 ETH per day requires an admin approval',
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
              criterion: 'checkPrincipalGroup',
              args: ['treasury-group-id']
            },
            {
              criterion: 'checkSpendingLimit',
              args: {
                limit: '1000000000000000000',
                operator: 'gt' as ValueOperators,
                timeWindow: {
                  type: 'rolling',
                  value: 86400
                },
                filters: {
                  userGroups: ['treasury-group-id'],
                  tokens: ['eip155:1/slip44:60']
                }
              }
            },
            {
              criterion: 'checkApprovals',
              args: [
                {
                  approvalCount: 1,
                  countPrincipal: false,
                  approvalEntityType: 'Narval::UserRole' as EntityType,
                  entityIds: ['admin']
                }
              ]
            }
          ],
          then: 'permit'
        }
      ]

      await createClient(systemManagerHexPk, {
        clientId,
        authHost: getAuthHost(),
        authAdminApiKey: getAuthAdminApiKey()
      })
      await saveDataStore(systemManagerHexPk, {
        clientId,
        host: getAuthHost(),
        entities,
        policies
      })
    })

    it('alice-admin does a transfer that is not counted against the spending limit', async () => {
      const { authClient } = await buildAuthClient(alicePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits treasury-group member bob to do a transfer', async () => {
      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits treasury-group member carol to do a transfer', async () => {
      const { authClient } = await buildAuthClient(carolPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('forbids member bob to exceed the limit', async () => {
      expect.assertions(1)
      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      try {
        await authClient.requestAccessToken(request)
      } catch (error: any) {
        expect(error.message).toEqual('Unauthorized')
      }
    })

    it('forbids member carol to exceed the limit', async () => {
      expect.assertions(1)
      const { authClient } = await buildAuthClient(carolPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      try {
        await authClient.requestAccessToken(request)
      } catch (error: any) {
        expect(error.message).toEqual('Unauthorized')
      }
    })

    it('permits admin alice to do a transfer', async () => {
      const { authClient } = await buildAuthClient(alicePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(request)
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits bob to exceed limit with alice-admin approval', async () => {
      expect.assertions(2)

      const { authClient: adminClient } = await buildAuthClient(alicePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const res = await authClient.authorize(request)
      expect(res.decision).toEqual(Decision.CONFIRM)

      if (res.decision === Decision.CONFIRM) {
        await adminClient.approve(res.authId)

        const accessToken = await authClient.getAccessToken(res.authId)
        expect(accessToken).toMatchObject({ value: expect.any(String) })
      }
    })

    it('permits carol to exceed limit with alice-admin approval', async () => {
      expect.assertions(2)

      const { authClient: adminClient } = await buildAuthClient(alicePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const { authClient } = await buildAuthClient(carolPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const res = await authClient.authorize(request)
      expect(res.decision).toEqual(Decision.CONFIRM)

      if (res.decision === Decision.CONFIRM) {
        await adminClient.approve(res.authId)

        const accessToken = await authClient.getAccessToken(res.authId)
        expect(accessToken).toMatchObject({ value: expect.any(String) })
      }
    })
  })
})
