/* eslint-disable jest/consistent-test-it */
import { Action, Decision, entitiesSchema, FIXTURE, policySchema, Request } from '@narval/policy-engine-shared'
import { v4 } from 'uuid'
import defaultEntities from '../../../resource/entity/test.default.json'
import approvalsAndSpendingLimit from '../../../resource/policy/set/approvals-and-spending-limit.json'
import { buildAuthClient, createClient, saveDataStore } from '../../../util/setup'

const TEST_TIMEOUT_MS = 30_000

jest.setTimeout(TEST_TIMEOUT_MS)

export const peradvanceTime = (hours: number): void => {
  jest.useFakeTimers()
  jest.setSystemTime(Date.now() + hours * 60 * 60 * 1000)
}

const systemManagerHexPk = FIXTURE.UNSAFE_PRIVATE_KEY.Root

const getAuthHost = () => 'http://localhost:3005'
const getAuthAdminApiKey = () => 'armory-admin-api-key'
const davePrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Dave
const alicePrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Alice
const ericPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Eric

const genNonce = (request: Request) => ({ ...request, nonce: `${request.nonce}-${v4()}` })

describe('approvals and spending limits', () => {
  describe('members can spend up to 1 eth  day, above an approval is required', () => {
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
      const policies = approvalsAndSpendingLimit.map((policy) => policySchema.parse(policy))

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

    it('treasury-group member dave does a non-eth transfer that is counted against the spending limit', async () => {
      const { authClient } = await buildAuthClient(davePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(
        genNonce({
          ...request,
          transactionRequest: { ...request.transactionRequest, chainId: 137 }
        })
      )
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits treasury-group member dave to do a transfer', async () => {
      const { authClient } = await buildAuthClient(davePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(genNonce(request))
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits treasury-group member eric to do a transfer', async () => {
      const { authClient } = await buildAuthClient(ericPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(genNonce(request))
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('forbids member dave to exceed the limit', async () => {
      expect.assertions(1)
      const { authClient } = await buildAuthClient(davePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      try {
        await authClient.requestAccessToken(genNonce(request))
      } catch (error: any) {
        expect(error.message).toEqual('Unauthorized')
      }
    })

    it('forbids member eric to exceed the limit', async () => {
      expect.assertions(1)
      const { authClient } = await buildAuthClient(ericPrivateKey, {
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

    it('permits dave to exceed limit with alice-admin approval', async () => {
      expect.assertions(2)

      const { authClient: adminClient } = await buildAuthClient(alicePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const { authClient } = await buildAuthClient(davePrivateKey, {
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

    it('permits eric to exceed limit with alice-admin approval', async () => {
      expect.assertions(2)

      const { authClient: adminClient } = await buildAuthClient(alicePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const { authClient } = await buildAuthClient(ericPrivateKey, {
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
