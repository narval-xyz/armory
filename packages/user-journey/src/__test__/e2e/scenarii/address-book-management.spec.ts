import {
  AccountClassification,
  Action,
  Decision,
  entitiesSchema,
  FIXTURE,
  policySchema,
  Request
} from '@narval/policy-engine-shared'
import { AddressBookAddresses } from 'packages/policy-engine-shared/src/lib/dev.fixture'
import { v4 } from 'uuid'
import { Hex } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import defaultEntities from '../../../resource/entity/test.default.json'
import addressBookAndRoles from '../../../resource/policy/set/address-book-and-roles.json'
import { buildAuthClient, createClient, saveDataStore } from '../../../util/setup'

const TEST_TIMEOUT_MS = 30_000

jest.setTimeout(TEST_TIMEOUT_MS)

const systemManagerHexPk = FIXTURE.UNSAFE_PRIVATE_KEY.Root

const getAuthHost = () => 'http://localhost:3005'
const getAuthAdminApiKey = () => 'armory-admin-api-key'
const ericPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Eric
const systemManagerPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.SystemManager
const alicePrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Alice
const bobPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Bob
const carolPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Carol

describe('address book management', () => {
  const clientId = v4()

  const newPrivateKey = generatePrivateKey()
  const newAddress = privateKeyToAccount(newPrivateKey).address.toLowerCase() as Hex

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

  it('permits member eric to send from managed to internal', async () => {
    const { authClient } = await buildAuthClient(ericPrivateKey, {
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

  it('forbids member eric to send from managed to unknown', async () => {
    const { authClient } = await buildAuthClient(ericPrivateKey, {
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

  it('permits manager carol to send from managed to counterparty', async () => {
    const { authClient } = await buildAuthClient(carolPrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const request: Request = {
      action: Action.SIGN_TRANSACTION,
      nonce: 'test-nonce-3',
      transactionRequest: {
        from: FIXTURE.ACCOUNT.Treasury.address,
        to: AddressBookAddresses.CounterParty,
        value: '0xde0b6b3a7640000',
        chainId: 1
      },
      resourceId: FIXTURE.ACCOUNT.Treasury.id
    }

    const { decision } = await authClient.authorize(request)

    expect(decision).toEqual(Decision.PERMIT)
  }),
    it('forbids manager carol to send from managed to external', async () => {
      const { authClient } = await buildAuthClient(carolPrivateKey, {
        host: getAuthHost(),
        clientId
      })

      const request: Request = {
        action: Action.SIGN_TRANSACTION,
        nonce: 'test-nonce-4',
        transactionRequest: {
          from: FIXTURE.ACCOUNT.Treasury.address,
          to: AddressBookAddresses.External,
          value: '0xde0b6b3a7640000',
          chainId: 1
        },
        resourceId: FIXTURE.ACCOUNT.Treasury.id
      }

      const { decision } = await authClient.authorize(request)
      expect(decision).toEqual(Decision.FORBID)
    })

  it('bob can transfer from account A to account B', async () => {
    const source = '0x0f610AC9F0091f8F573c33f15155afE8aD747495'
    const destination = '0x76d1b7f9b3F69C435eeF76a98A415332084A856F'

    const { authClient } = await buildAuthClient(bobPrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const request: Request = {
      action: Action.SIGN_TRANSACTION,
      nonce: 'test-nonce-6',
      transactionRequest: {
        from: source,
        to: destination,
        value: '0x4563918244F40000',
        chainId: 137
      },
      resourceId: `eip155:eoa:${source}`
    }

    const { decision } = await authClient.authorize(request)

    expect(decision).toEqual(Decision.PERMIT)
  })

  it('permits member eric to send to now known address', async () => {
    const { authClient } = await buildAuthClient(ericPrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const newEntities = entitiesSchema.parse({
      ...defaultEntities,
      addressBook: [
        ...defaultEntities.addressBook,
        {
          id: `eip155:137:${newAddress}`,
          address: newAddress,
          chainId: 137,
          classification: AccountClassification.INTERNAL
        }
      ]
    })

    await saveDataStore(systemManagerHexPk, {
      clientId,
      host: getAuthHost(),
      entities: newEntities,
      policies: addressBookAndRoles.map((policy) => policySchema.parse(policy))
    })

    const request: Request = {
      action: Action.SIGN_TRANSACTION,
      nonce: 'test-nonce-7',
      transactionRequest: {
        from: FIXTURE.ACCOUNT.Treasury.address,
        to: newAddress,
        value: '0xde0b6b3a7640000',
        chainId: 137
      },
      resourceId: FIXTURE.ACCOUNT.Treasury.id
    }

    const { decision } = await authClient.authorize(request)

    expect(decision).toEqual(Decision.PERMIT)
  })
})
