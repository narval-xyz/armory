import { toHex } from 'viem'
import { Action, SignTypedDataAction } from '../../type/action.type'

describe('SignTypedDataAction', () => {
  const typedData = {
    domain: {
      name: 'Ether Mail',
      version: '1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    },
    types: {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'account', type: 'address' }
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' }
      ]
    },
    primaryType: 'Mail',
    message: {
      from: {
        name: 'Cow',
        account: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
      },
      to: {
        name: 'Bob',
        account: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
      },
      contents: 'Hello, Bob!'
    }
  }

  it('should validate a valid SignTypedDataAction object', () => {
    const validAction = {
      action: Action.SIGN_TYPED_DATA,
      nonce: 'xxx',
      resourceId: 'resourceId',
      typedData
    }

    const result = SignTypedDataAction.safeParse(validAction)

    expect(result).toEqual({
      success: true,
      data: expect.any(Object)
    })
  })

  it('should validate a valid typedData as a string', () => {
    const validAction = {
      action: Action.SIGN_TYPED_DATA,
      nonce: 'xxx',
      resourceId: 'resourceId',
      typedData: JSON.stringify(typedData)
    }

    const result = SignTypedDataAction.safeParse(validAction)

    expect(result.success).toEqual(true)
  })

  it('should validate a valid typedData as a hex-encoded stringified json object', () => {
    const validAction = {
      action: Action.SIGN_TYPED_DATA,
      nonce: 'xxx',
      resourceId: 'resourceId',
      typedData: toHex(JSON.stringify(typedData))
    }

    const result = SignTypedDataAction.safeParse(validAction)

    expect(result.success).toEqual(true)
  })

  it('should not validate an invalid SignTypedDataAction object with invalid JSON string', () => {
    const invalidAction = {
      action: Action.SIGN_TYPED_DATA,
      nonce: 'xxx',
      resourceId: 'resourceId',
      typedData: 'invalidJSON'
    }

    const result = SignTypedDataAction.safeParse(invalidAction)

    expect(result.success).toEqual(false)
  })
})
