/* eslint-disable jest/consistent-test-it */
import { Action, Decision, entitiesSchema, FIXTURE, policySchema, Request, toHex } from '@narval/policy-engine-shared'
import { v4 } from 'uuid'
import defaultEntities from '../../../resource/entity/test.default.json'
import tieredEthTransfer from '../../../resource/policy/set/tiered-eth-transfer.json'
import { buildAuthClient, createClient, saveDataStore } from '../../../util/setup'

const TEST_TIMEOUT_MS = 30_000

jest.setTimeout(TEST_TIMEOUT_MS)

const systemManagerHexPk = FIXTURE.UNSAFE_PRIVATE_KEY.Root

const getAuthHost = () => 'http://localhost:3005'
const getAuthAdminApiKey = () => 'armory-admin-api-key'
const ericPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Eric
const alicePrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Alice
const bobPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Bob
const carolPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Carol

const genNonce = (request: Request) => ({ ...request, nonce: `${request.nonce}-${v4()}` })

describe('tiered approvals and spending limits', () => {
  const request: Request = {
    action: Action.SIGN_TRANSACTION,
    nonce: 'test-nonce-4',
    transactionRequest: {
      from: '0x0301e2724a40E934Cce3345928b88956901aA127',
      to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
      value: '0x8AC7230489E80000', // 10 ETH
      chainId: 1
    },
    resourceId: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127'
  }

  // Generate a new client ID for each test run, otherwise historical data with persist between tests if using a long-lived db.
  const clientId = v4()

  // 18446744073709551615
  // 9223372036854776000
  beforeAll(async () => {
    const entities = entitiesSchema.parse(defaultEntities)

    const policies = tieredEthTransfer.map((policy) => {
      return policySchema.parse(policy)
    })

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

  it('permits member to transfer less than or equal to 1 ETH', async () => {
    const { authClient } = await buildAuthClient(ericPrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const lowValueRequest = genNonce({
      ...request,
      transactionRequest: {
        ...request.transactionRequest,
        value: toHex(1000000000000000000n) // 1 ETH
      }
    })

    const response = await authClient.requestAccessToken(lowValueRequest)
    expect(response).toMatchObject({ value: expect.any(String) })
  })

  it('requires manager approval for transfers between 1 and 10 ETH', async () => {
    expect.assertions(2)

    const { authClient: managerClient } = await buildAuthClient(carolPrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const { authClient } = await buildAuthClient(ericPrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const mediumValueRequest = genNonce({
      ...request,
      transactionRequest: {
        ...request.transactionRequest,
        value: '0x4563918244F40000' // 5 ETH
      }
    })

    const res = await authClient.authorize(mediumValueRequest)
    expect(res.decision).toEqual(Decision.CONFIRM)

    if (res.decision === Decision.CONFIRM) {
      await managerClient.approve(res.authId)

      const accessToken = await authClient.getAccessToken(res.authId)
      expect(accessToken).toMatchObject({ value: expect.any(String) })
    }
  })

  it('requires admin approval for transfers between 10 and 100 ETH', async () => {
    expect.assertions(2)

    const { authClient: adminClient } = await buildAuthClient(alicePrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const { authClient } = await buildAuthClient(ericPrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const highValueRequest = genNonce({
      action: Action.SIGN_TRANSACTION,
      nonce: 'test-nonce-4',
      transactionRequest: {
        from: '0x0301e2724a40E934Cce3345928b88956901aA127',
        to: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
        value: '0x8000000000000000', // 10 ETH
        chainId: 1
      },
      resourceId: 'eip155:eoa:0x0301e2724a40e934cce3345928b88956901aa127'
    })

    const res = await authClient.authorize(highValueRequest)
    expect(res.decision).toEqual(Decision.CONFIRM)

    if (res.decision === Decision.CONFIRM) {
      await adminClient.approve(res.authId)

      const accessToken = await authClient.getAccessToken(res.authId)
      expect(accessToken).toMatchObject({ value: expect.any(String) })
    }
  })

  it('requires two admin approvals for transfers above 100 ETH', async () => {
    expect.assertions(2)

    const { authClient: adminClient1 } = await buildAuthClient(alicePrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const { authClient: adminClient2 } = await buildAuthClient(bobPrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const { authClient } = await buildAuthClient(ericPrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const veryHighValueRequest = genNonce({
      ...request,
      transactionRequest: {
        ...request.transactionRequest,
        value: '0x56BC75E2D63100000' // 150 ETH
      }
    })

    const res = await authClient.authorize(veryHighValueRequest)
    expect(res.decision).toEqual(Decision.CONFIRM)

    if (res.decision === Decision.CONFIRM) {
      await adminClient1.approve(res.authId)
      await adminClient2.approve(res.authId)

      const accessToken = await authClient.getAccessToken(res.authId)
      expect(accessToken).toMatchObject({ value: expect.any(String) })
    }
  })
})
