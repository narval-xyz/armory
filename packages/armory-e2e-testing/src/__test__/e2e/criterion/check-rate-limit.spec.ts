import { Action, entitiesSchema, FIXTURE, Request } from '@narval/policy-engine-shared'
import { v4 } from 'uuid'
import defaultEntities from '../../../resource/entity/test.default.json'
import adminPermitAll from '../../../resource/policy/checkPrincipalRole/admin-permit-all.json'
import memberTwoTransferPerDay from '../../../resource/policy/checkRateLimit/members-2-transfer-per-day.json'
import {
  buildAuthClient,
  buildPolicy,
  createClient,
  genNonce,
  getAuthAdminApiKey,
  getAuthHost,
  saveDataStore
} from '../../../util/setup'

const systemManagerHexPk = FIXTURE.UNSAFE_PRIVATE_KEY.Root
const ericPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Eric
const alicePrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Alice

// !! This criteria is not meant to be used alone in a policy.
// !! This criteria matches ALL incoming requests.
// !! Filters of the criteria are used to filter historical data, not incoming request
// !! If you have one policy that permits based on a group spendings
// !! It will allow anyone even if they are not in the group to spend until the aggregated limit is reached
// !! Spendings of people not in the group will not be counted against the group limit

describe('checkRateLimit', () => {
  describe('rate limiting by principal', () => {
    const request: Request = {
      action: Action.SIGN_TRANSACTION,
      nonce: 'test-nonce-1',
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
      const entities = entitiesSchema.parse(defaultEntities)

      await createClient(systemManagerHexPk, {
        clientId,
        authHost: getAuthHost(),
        authAdminApiKey: getAuthAdminApiKey()
      })

      const policies = buildPolicy([adminPermitAll, memberTwoTransferPerDay])

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

      const response = await authClient.requestAccessToken(genNonce(request))
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits member eric to do a first transfer', async () => {
      // First transfer
      const { authClient } = await buildAuthClient(ericPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(genNonce(request))
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('permits member eric to do a second transfer', async () => {
      // Second transfer
      const { authClient } = await buildAuthClient(ericPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const response = await authClient.requestAccessToken(genNonce(request))
      expect(response).toMatchObject({ value: expect.any(String) })
    })

    it('forbids member eric to do a third transfer', async () => {
      expect.assertions(1)
      // Third transfer
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
  })
})
