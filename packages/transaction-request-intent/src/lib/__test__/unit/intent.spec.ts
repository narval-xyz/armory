import { AssetTypeEnum, Intents, NULL_METHOD_ID } from '../../domain'
import { getAssetType, validateIntent } from '../../intent'
import { Erc1155Methods, Erc20Methods, Erc721Methods } from '../../methodId'
import { ERC20_TRANSFER_TX_REQUEST } from './mocks'

describe('getAssetType', () => {
  it('identify ERC20', () => {
    const res = getAssetType(Erc20Methods.TRANSFER)
    expect(res).toEqual(AssetTypeEnum.ERC20)
  })
  it('identify ERC721 safeTransferFrom', () => {
    const res = getAssetType(Erc721Methods.SAFE_TRANSFER_FROM)
    expect(res).toEqual(AssetTypeEnum.ERC721)
  })
  it('identify ERC721 safeTransferFrom overflow', () => {
    const res = getAssetType(Erc721Methods.SAFE_TRANSFER_FROM_WITH_BYTES)
    expect(res).toEqual(AssetTypeEnum.ERC721)
  })
  it('identify ERC1155 safeBatchTransferFrom', () => {
    const res = getAssetType(Erc1155Methods.SAFE_BATCH_TRANSFER_FROM)
    expect(res).toEqual(AssetTypeEnum.ERC1155)
  })
  it('identify ERC1155 safeTransferFrom', () => {
    const res = getAssetType(Erc1155Methods.SAFE_TRANSFER_FROM)
    expect(res).toEqual(AssetTypeEnum.ERC1155)
  })
  it('identify ambiguous erc721 transferFrom', () => {
    const res = getAssetType(Erc721Methods.TRANSFER_FROM)
    expect(res).toEqual(AssetTypeEnum.AMBIGUOUS_TRANSFER)
  })
  it('identify ambiguous erc20 transferFrom', () => {
    const res = getAssetType(Erc20Methods.TRANSFER_FROM)
    expect(res).toEqual(AssetTypeEnum.AMBIGUOUS_TRANSFER)
  })
  it('identify native transfer', () => {
    const value = '0x111'
    const res = getAssetType(NULL_METHOD_ID, value)
    expect(res).toEqual(AssetTypeEnum.NATIVE)
  })
  it('defaults to unknown', () => {
    const res = getAssetType('invalid asset type')
    expect(res).toEqual(AssetTypeEnum.UNKNOWN)
  })
  it('unknown when NULL_METHOD_ID is passed without value', () => {
    const res = getAssetType(NULL_METHOD_ID)
    expect(res).toEqual(AssetTypeEnum.UNKNOWN)
  })
})

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
