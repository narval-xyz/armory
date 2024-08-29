import { Action, Decision, entitiesSchema, FIXTURE, Request } from '@narval/policy-engine-shared'
import { v4 } from 'uuid'
import defaultEntities from '../../../../resource/entity/default.json'
import twoAdminApproval from '../../../../resource/policy/checkApprovals/2-admin-approval-required.json'
import adminApproval from '../../../../resource/policy/checkApprovals/admin-approval-required.json'
import adminPermitAll from '../../../../resource/policy/checkPrincipalRole/admin-permit-all.json'
import {
  buildAuthClient,
  buildPolicy,
  createClient,
  genNonce,
  getAuthAdminApiKey,
  getAuthHost,
  saveDataStore
} from '../../util/setup'

const systemManagerHexPk = FIXTURE.UNSAFE_PRIVATE_KEY.Root
const bobPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Bob
const alicePrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Alice
const davePrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Dave

describe('checkApprovals', () => {
  describe('entity type', () => {
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

      const policies = buildPolicy([adminPermitAll, adminApproval])

      await saveDataStore(systemManagerHexPk, {
        clientId,
        host: getAuthHost(),
        entities,
        policies
      })
    })

    it('get an accessToken after approval from an admin', async () => {
      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const { decision, authId } = await authClient.authorize(genNonce(request))
      expect(decision).toBe(Decision.CONFIRM)

      const { authClient: adminClient } = await buildAuthClient(alicePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      await adminClient.approve(authId)

      const accessToken = await authClient.getAccessToken(authId)

      expect(accessToken).toMatchObject({ value: expect.any(String) })
    })
  })

  describe('approvalCount', () => {
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

      const policies = buildPolicy([adminPermitAll, twoAdminApproval])

      await saveDataStore(systemManagerHexPk, {
        clientId,
        host: getAuthHost(),
        entities,
        policies
      })
    })

    it('is still unauthorized after an admin approval', async () => {
      expect.assertions(3)

      const { authClient } = await buildAuthClient(bobPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const { decision, authId } = await authClient.authorize(genNonce(request))
      expect(decision).toBe(Decision.CONFIRM)

      const { authClient: adminClient } = await buildAuthClient(alicePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      await adminClient.approve(authId)

      try {
        await authClient.getAccessToken(authId)
      } catch (e: any) {
        expect(e.message).toEqual('Unauthorized')
      }

      const { authClient: secondAdminClient } = await buildAuthClient(davePrivateKey, {
        host: getAuthHost(),
        clientId
      })

      await secondAdminClient.approve(authId)

      const accessToken = await authClient.getAccessToken(authId)

      expect(accessToken).toMatchObject({ value: expect.any(String) })
    })
  })
})
