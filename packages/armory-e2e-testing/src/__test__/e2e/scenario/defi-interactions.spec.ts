import {
  Action,
  Eip712Domain,
  Eip712TypedData,
  entitiesSchema,
  FIXTURE,
  policySchema,
  Request
} from '@narval/policy-engine-shared'
import { v4 } from 'uuid'
import defiEntities from '../../../resource/entity/defi-interaction.json'
import defiInteractionPolicy from '../../../resource/policy/set/defi-interaction.json'
import { buildAuthClient, createClient, saveDataStore } from '../../../util/setup'

const TEST_TIMEOUT_MS = 30_000

jest.setTimeout(TEST_TIMEOUT_MS)

const systemManagerHexPk = FIXTURE.UNSAFE_PRIVATE_KEY.Root

const getAuthHost = () => 'http://localhost:3005'
const getAuthAdminApiKey = () => 'armory-admin-api-key'
const ericPrivateKey = FIXTURE.UNSAFE_PRIVATE_KEY.Eric

const genNonce = (request: Request) => ({ ...request, nonce: `${request.nonce}-${v4()}` })

describe('Uniswap governance', () => {
  const clientId = v4()

  beforeAll(async () => {
    const entities = entitiesSchema.parse(defiEntities)
    const policies = defiInteractionPolicy.map((policy) => policySchema.parse(policy))

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

  it('uniswap traders can signMessage with uniswap trader accounts', async () => {
    const { authClient } = await buildAuthClient(ericPrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const request = genNonce({
      action: Action.SIGN_MESSAGE,
      nonce: 'test-nonce-1',
      message: 'Log in uniswap',
      resourceId: 'eip155:eoa:0x9f38879167acCf7401351027EE3f9247A71cd0c5'
    })

    const accessToken = await authClient.requestAccessToken(request)
    expect(accessToken).toMatchObject({ value: expect.any(String) })
  })

  it('uniswap traders can do permit or permit2 with uniswap trader accounts', async () => {
    // Uniswap's Permit2 domain
    const PERMIT2_DOMAIN_NAME = 'Permit2'
    const PERMIT2_DOMAIN_VERSION = '1'
    const PERMIT2_ADDRESS = '0x000000000022d473030f116ddee9f6b43ac78ba3'

    const domain: Eip712Domain = {
      name: PERMIT2_DOMAIN_NAME,
      version: PERMIT2_DOMAIN_VERSION,
      chainId: 1,
      verifyingContract: PERMIT2_ADDRESS
    }

    // Uniswap's Permit2 types
    const types = {
      PermitSingle: [
        { name: 'details', type: 'PermitDetails' },
        { name: 'spender', type: 'address' },
        { name: 'sigDeadline', type: 'uint256' }
      ],
      PermitDetails: [
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint160' },
        { name: 'expiration', type: 'uint48' },
        { name: 'nonce', type: 'uint48' }
      ]
    }

    // Example payload
    const permitSinglePayload = {
      details: {
        token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        amount: '0xfffffffffffffff',
        expiration: Math.floor(Date.now() / 1000) + 86400,
        nonce: 0,
        owner: '0x9f38879167acCf7401351027EE3f9247A71cd0c5'
      },
      spender: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      sigDeadline: Math.floor(Date.now() / 1000) + 3600
    }

    const dataToSign: Eip712TypedData = {
      types: types,
      domain: domain,
      primaryType: 'PermitSingle',
      message: permitSinglePayload
    }

    const { authClient } = await buildAuthClient(ericPrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const request = genNonce({
      action: Action.SIGN_TYPED_DATA,
      nonce: 'test-nonce-2',
      typedData: dataToSign,
      resourceId: 'eip155:eoa:0x9f38879167acCf7401351027EE3f9247A71cd0c5'
    })

    const accessToken = await authClient.requestAccessToken(request)
    expect(accessToken).toMatchObject({ value: expect.any(String) })
  })

  it('uniswap traders can call multicall with uniswap trader accounts on universal router', async () => {
    const { authClient } = await buildAuthClient(ericPrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const request = genNonce({
      action: Action.SIGN_TRANSACTION,
      nonce: 'test-nonce-3',
      transactionRequest: {
        from: '0x9f38879167acCf7401351027EE3f9247A71cd0c5',
        to: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
        data: '0xac9650d800000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000164883164560000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf12700000000000000000000000003c499c542cef5e3811e1192ce70d8cc03d5c335900000000000000000000000000000000000000000000000000000000000001f4fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffba244fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffba258000000000000000000000000000000000000000000000000008259804f52ed0e0000000000000000000000000000000000000000000000000000000000000ea000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000084e6a5e3442d348ba5e149e362846be6fcf2e9e0000000000000000000000000000000000000000000000000000000066e3097a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000412210e8a00000000000000000000000000000000000000000000000000000000',
        value: '0x0',
        chainId: 1
      },
      resourceId: 'eip155:eoa:0x9f38879167acCf7401351027EE3f9247A71cd0c5'
    })

    const accessToken = await authClient.requestAccessToken(request)
    expect(accessToken).toMatchObject({ value: expect.any(String) })
  })

  it('uniswap traders can call swap with uniswap trader accounts on universal router', async () => {
    const { authClient } = await buildAuthClient(ericPrivateKey, {
      host: getAuthHost(),
      clientId
    })

    const request = genNonce({
      action: Action.SIGN_TRANSACTION,
      nonce: 'test-nonce-4',
      transactionRequest: {
        from: '0x9f38879167acCf7401351027EE3f9247A71cd0c5',
        to: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
        data: '0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000066e3085500000000000000000000000000000000000000000000000000000000000000040b000604000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002386f26fc100000000000000000000000000000000000000000000000000000000000000000dec00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b0d500b1d8e8ef31e21c99d1db9a6444d3adf12700000643c499c542cef5e3811e1192ce70d8cc03d5c335900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000003c499c542cef5e3811e1192ce70d8cc03d5c33590000000000000000000000007ffc3dbf3b2b50ff3a1d5523bc24bb5043837b14000000000000000000000000000000000000000000000000000000000000001900000000000000000000000000000000000000000000000000000000000000600000000000000000000000003c499c542cef5e3811e1192ce70d8cc03d5c335900000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000dec',
        value: '0x0',
        chainId: 1
      },
      resourceId: 'eip155:eoa:0x9f38879167acCf7401351027EE3f9247A71cd0c5'
    })

    const accessToken = await authClient.requestAccessToken(request)

    expect(accessToken).toMatchObject({ value: expect.any(String) })
  })
})
