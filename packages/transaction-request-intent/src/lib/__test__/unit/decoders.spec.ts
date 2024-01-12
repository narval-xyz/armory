import { IntentRequest } from '../../../shared/types'
import { AssetTypeEnum, Intents } from '../../../utils/domain'
import { Erc20Methods } from '../../../utils/standard-functions/methodId'
import { decodeIntent } from '../../decoders'

jest.mock('viem', () => ({
  decodeAbiParameters: jest
    .fn()
    .mockReturnValueOnce(['0x031d8C0cA142921c459bCB28104c0FF37928F9eD', BigInt('428406414311469998210669')])
}))

describe('decodeIntent', () => {
  it('decodes ERC20 intent correctly', () => {
    const erc20Request: IntentRequest = {
      methodId: Erc20Methods.TRANSFER,
      assetType: AssetTypeEnum.ERC20,
      type: Intents.TRANSFER_ERC20,
      validatedFields: {
        data: '0xa9059cbb000000000000000000000000031d8c0ca142921c459bcb28104c0ff37928f9ed000000000000000000000000000000000000000000005ab7f55035d1e7b4fe6d',
        to: '0x000000000000000000000000000000000000000001',
        chainId: '1'
      }
    }

    const result = decodeIntent(erc20Request)

    expect(result).toEqual({
      type: Intents.TRANSFER_ERC20,
      amount: '428406414311469998210669',
      token: 'eip155:1:0x000000000000000000000000000000000000000001'
    })
  })
})
