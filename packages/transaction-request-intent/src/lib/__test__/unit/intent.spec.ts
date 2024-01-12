import { AssetTypeEnum, Intents } from '../../domain'
import { validateIntent } from '../../intent'
import { Erc20Methods } from '../../methodId'
import { ERC20_TRANSFER_TX_REQUEST } from './mocks'

describe('validateIntent', () => {
  it('validate good data', () => {
    expect(validateIntent(ERC20_TRANSFER_TX_REQUEST)).toEqual({
      methodId: Erc20Methods.TRANSFER,
      assetType: AssetTypeEnum.ERC20,
      type: Intents.TRANSFER_ERC20,
      validatedFields: {
        data: '0xa9059cbb000000000000000000000000031d8c0ca142921c459bcb28104c0ff37928f9ed000000000000000000000000000000000000000000005ab7f55035d1e7b4fe6d',
        to: '0x031d8C0cA142921c459bCB28104c0FF37928F9eD',
        chainId: '137'
      }
    })
  })
})
