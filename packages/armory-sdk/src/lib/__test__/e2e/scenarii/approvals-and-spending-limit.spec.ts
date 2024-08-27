/* eslint-disable jest/consistent-test-it */
import {
  Action,
  Decision,
  entitiesSchema,
  EntityType,
  FIXTURE,
  Policy,
  Request,
  ValueOperators
} from '@narval/policy-engine-shared'
import { v4 } from 'uuid'
import defaultEntities from '../../../../resource/entity/default.json'
import { buildAuthClient, createClient, saveDataStore } from '../../util/setup'

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

const genNonce = (request: Request) => ({ ...request, nonce: `${request.nonce}-${v4()}` })

describe('End to end scenarios', () => {
  describe('members can spend up to 1 eth per day, above an approval is required', () => {
    const request: Request = {
      action: Action.SIGN_TRANSACTION,
      nonce: 'test-nonce-4',
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
      const entities = entitiesSchema.parse(defaultEntities)

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

      const response = await authClient.requestAccessToken(genNonce(request))
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits treasury-group member bob to do a transfer', async () => {
      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(genNonce(request))
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits treasury-group member carol to do a transfer', async () => {
      const { authClient } = await buildAuthClient(carolPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(genNonce(request))
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('forbids member bob to exceed the limit', async () => {
      expect.assertions(1)
      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      try {
        await authClient.requestAccessToken(genNonce(request))
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
        await authClient.requestAccessToken(genNonce(request))
      } catch (error: any) {
        expect(error.message).toEqual('Unauthorized')
      }
    })

    it('permits admin alice to do a transfer', async () => {
      const { authClient } = await buildAuthClient(alicePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(genNonce(request))
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

      const req = genNonce(request)

      const res = await authClient.authorize(req)
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

      const res = await authClient.authorize(genNonce(request))
      expect(res.decision).toEqual(Decision.CONFIRM)

      if (res.decision === Decision.CONFIRM) {
        await adminClient.approve(res.authId)

        const accessToken = await authClient.getAccessToken(res.authId)
        expect(accessToken).toMatchObject({ value: expect.any(String) })
      }
    })
  })
})
