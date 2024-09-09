import { Action, Decision, entitiesSchema, FIXTURE, policySchema, Request } from '@narval/policy-engine-shared'
import { v4 } from 'uuid'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import defaultEntities from '../../../../resource/entity/test.default.json'
import addressBookAndRoles from '../../../../resource/policy/set/address-book-and-roles.json'
import { buildAuthClient, createClient, saveDataStore } from '../../util/setup'

const TEST_TIMEOUT_MS = 30_000

jest.setTimeout(TEST_TIMEOUT_MS)

const systemManagerHexPk = FIXTURE.UNSAFE_PRIVATE_KEY.Root

const getAuthHost = () => 'http://localhost:3005'
const getAuthAdminApiKey = () => 'armory-admin-api-key'
const antoinePrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Antoine
const systemManagerPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.SystemManager
const alicePrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Alice
const bobPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Bob
const carolPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Carol

describe('address book management', () => {
  const clientId = v4()

  const newPrivateKey = generatePrivateKey()
  const { address: newAddress } = privateKeyToAccount(newPrivateKey)
  beforeAll(async () => {
    const entities = entitiesSchema.parse(defaultEntities)

    const policies = addressBookAndRoles.map((policy) => {
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

  it('permits member antoine to send from managed to internal', async () => {
    const { authClient } = await buildAuthClient(antoinePrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const request: Request = {
      action: Action.SIGN_TRANSACTION,
      nonce: 'test-nonce-1',
      transactionRequest: {
        from: FIXTURE.ACCOUNT.Treasury.address,
        to: FIXTURE.ACCOUNT.Engineering.address,
        value: '0xde0b6b3a7640000',
        chainId: 1
      },
      resourceId: FIXTURE.ACCOUNT.Treasury.id
    }

    const { decision } = await authClient.authorize(request)

    expect(decision).toEqual(Decision.PERMIT)
  })

  it('forbids member antoine to send from managed to unknown', async () => {
    const { authClient } = await buildAuthClient(antoinePrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const request: Request = {
      action: Action.SIGN_TRANSACTION,
      nonce: 'test-nonce-2',
      transactionRequest: {
        from: FIXTURE.ACCOUNT.Treasury.address,
        to: newAddress,
        value: '0xde0b6b3a7640000',
        chainId: 1
      },
      resourceId: FIXTURE.ACCOUNT.Treasury.id
    }

    const { decision } = await authClient.authorize(request)

    expect(decision).toEqual(Decision.FORBID)
  })
})
