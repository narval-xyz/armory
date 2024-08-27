import { Action, entitiesSchema, FIXTURE, Request } from '@narval/policy-engine-shared'
import { v4 } from 'uuid'
import defaultEntities from '../../../../resource/entity/default.json'
import adminPermitAll from '../../../../resource/policy/checkPrincipalRole/admin-permit-all.json'
import memberCanTransferOneEthFixed from '../../../../resource/policy/checkSpendingLimit/member-can-transfer-1-eth-fixed.json'
import memberCanTransferOneEthRolling from '../../../../resource/policy/checkSpendingLimit/member-can-transfer-1-eth-rolling.json'
import treasuryMemberCanTransferOneEth from '../../../../resource/policy/checkSpendingLimit/treasury-groupMember-can-transfer-1-eth-fixed.json'
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
const carolPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Carol
describe('by groupId', () => {
  const request: Request = {
    action: Action.SIGN_TRANSACTION,
    nonce: 'test-nonce-2',
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

    const policies = buildPolicy([adminPermitAll, treasuryMemberCanTransferOneEth])

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
})

describe('rolling window', () => {
  const request: Request = {
    action: Action.SIGN_TRANSACTION,
    nonce: 'test-nonce-3',
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
    const entities = entitiesSchema.parse(defaultEntities)
    const policies = buildPolicy([adminPermitAll, memberCanTransferOneEthRolling])

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

    const response = await authClient.requestAccessToken(genNonce(request))
    expect(response).toMatchObject({ value: expect.any(String) })
  })

  it('permits member bob to do a transfer', async () => {
    const { authClient } = await buildAuthClient(bobPrivateKey, {
      host: getAuthHost(),
      clientId
    })
    const response = await authClient.requestAccessToken(genNonce(request))
    expect(response).toMatchObject({ value: expect.any(String) })
  })

  it('permits member bob to do a second transfer', async () => {
    const { authClient } = await buildAuthClient(bobPrivateKey, {
      host: getAuthHost(),
      clientId
    })
    const response = await authClient.requestAccessToken(genNonce(request))
    expect(response).toMatchObject({ value: expect.any(String) })
  })

  it('permits member bob to do a third transfer', async () => {
    const { authClient } = await buildAuthClient(bobPrivateKey, {
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

  it('permits admin alice to do a transfer', async () => {
    const { authClient } = await buildAuthClient(alicePrivateKey, {
      host: getAuthHost(),
      clientId
    })
    const response = await authClient.requestAccessToken(genNonce(request))
    expect(response).toMatchObject({ value: expect.any(String) })
  })
})

describe('fixed window', () => {
  const request: Request = {
    action: Action.SIGN_TRANSACTION,
    nonce: 'test-nonce-3',
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
    const entities = entitiesSchema.parse(defaultEntities)
    const policies = buildPolicy([adminPermitAll, memberCanTransferOneEthFixed])

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

    const response = await authClient.requestAccessToken(genNonce(request))
    expect(response).toMatchObject({ value: expect.any(String) })
  })

  it('permits member bob to do a transfer', async () => {
    const { authClient } = await buildAuthClient(bobPrivateKey, {
      host: getAuthHost(),
      clientId
    })
    const response = await authClient.requestAccessToken(genNonce(request))
    expect(response).toMatchObject({ value: expect.any(String) })
  })

  it('permits member bob to do a second transfer', async () => {
    const { authClient } = await buildAuthClient(bobPrivateKey, {
      host: getAuthHost(),
      clientId
    })
    const response = await authClient.requestAccessToken(genNonce(request))
    expect(response).toMatchObject({ value: expect.any(String) })
  })

  it('permits member bob to do a third transfer', async () => {
    const { authClient } = await buildAuthClient(bobPrivateKey, {
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

  it('permits admin alice to do a transfer', async () => {
    const { authClient } = await buildAuthClient(alicePrivateKey, {
      host: getAuthHost(),
      clientId
    })
    const response = await authClient.requestAccessToken(genNonce(request))
    expect(response).toMatchObject({ value: expect.any(String) })
  })
})
