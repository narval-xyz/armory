import {
  Asset,
  AssetType,
  CaipError,
  ErrorCode,
  Namespace,
  getAccountId,
  getAssetId,
  parseAccount,
  safeGetAccountId,
  safeGetAssetId,
  safeParseAccount,
  safeParseAsset,
  safeParseCoin,
  safeParseToken,
  toAccountId,
  toAssetId
} from '../../caip.util'

describe('caip', () => {
  const validAddress = '0x5db3Bf14413d7e3c69FAA279EFa1D1B08637eC4c'
  const validAccountId = `${Namespace.EIP155}:1/${validAddress}`
  const invalidAccountId = 'invalid_caip10_id'
  const invalidAccountIdNamespace = 'invalid_namespace:1/0x1234567890abcdef'
  const invalidAccountIdAddress = `${Namespace.EIP155}:1/invalid_address`

  describe('safeParseAccount', () => {
    it('returns success for valid account id', () => {
      expect(safeParseAccount(validAccountId)).toEqual({
        success: true,
        value: {
          namespace: Namespace.EIP155,
          chainId: 1,
          address: validAddress
        }
      })
    })

    it('returns error for invalid account id format', () => {
      expect(safeParseAccount(invalidAccountId)).toEqual({
        success: false,
        error: ErrorCode.INVALID_CAIP_10_FORMAT
      })
    })

    it('returns error for invalid namespace', () => {
      expect(safeParseAccount(invalidAccountIdNamespace)).toEqual({
        success: false,
        error: ErrorCode.INVALID_NAMESPACE
      })
    })

    it('returns error for invalid address', () => {
      expect(safeParseAccount(invalidAccountIdAddress)).toEqual({
        success: false,
        error: ErrorCode.INVALID_ADDRESS
      })
    })
  })

  describe('safeGetAccountId', () => {
    it('returns success for valid account id', () => {
      expect(safeGetAccountId(validAccountId)).toEqual({
        success: true,
        value: validAccountId
      })
    })

    it('returns error for invalid account id format', () => {
      expect(safeGetAccountId(invalidAccountId)).toEqual({
        success: false,
        error: ErrorCode.INVALID_CAIP_10_FORMAT
      })
    })

    it('returns error for invalid namespace', () => {
      expect(safeGetAccountId(invalidAccountIdNamespace)).toEqual({
        success: false,
        error: ErrorCode.INVALID_NAMESPACE
      })
    })

    it('returns error for invalid address', () => {
      expect(safeGetAccountId(invalidAccountIdAddress)).toEqual({
        success: false,
        error: ErrorCode.INVALID_ADDRESS
      })
    })
  })

  describe('toAccountId', () => {
    it('converts arbitrary string to account id', () => {
      expect(
        toAccountId({
          namespace: Namespace.EIP155,
          chainId: 1,
          address: '0x1234567890abcdef'
        })
      ).toEqual(`${Namespace.EIP155}:1/0x1234567890abcdef`)
    })
  })

  describe('parseAccount', () => {
    it('returns account from arbitrary string', () => {
      expect(() => parseAccount(validAccountId)).not.toThrow()
      expect(parseAccount(validAccountId)).toEqual({
        namespace: Namespace.EIP155,
        chainId: 1,
        address: validAddress
      })
    })

    it('throws error for invalid account id formats', () => {
      expect(() => parseAccount(invalidAccountId)).toThrow(CaipError)
      expect(() => parseAccount(invalidAccountIdNamespace)).toThrow(CaipError)
      expect(() => parseAccount(invalidAccountIdAddress)).toThrow(CaipError)
    })
  })

  describe('getAccountId', () => {
    it('returns account id from arbitrary string', () => {
      expect(() => getAccountId(validAccountId)).not.toThrow()
      expect(getAccountId(validAccountId)).toEqual(validAccountId)
    })

    it('throws error for invalid account id formats', () => {
      expect(() => getAccountId(invalidAccountId)).toThrow(CaipError)
      expect(() => getAccountId(invalidAccountIdNamespace)).toThrow(CaipError)
      expect(() => getAccountId(invalidAccountIdAddress)).toThrow(CaipError)
    })
  })

  const validErc1155AssetId = `${Namespace.EIP155}:1/${AssetType.ERC1155}:${validAddress}`
  const validErc20AssetId = `${Namespace.EIP155}:137/${AssetType.ERC20}:${validAddress}`
  const validErc721CollectibleAssetId = `${Namespace.EIP155}:1/${AssetType.ERC721}:${validAddress}/999`
  const validNativeCoin = `${Namespace.EIP155}:1/${AssetType.SLIP44}:60`
  const invalidAssetId = 'invalid_caip19_id'
  const invalidAssetIdNamespace = `invalid_namespace:1/${AssetType.ERC1155}:${validAddress}`
  const invalidAssetIdAssetType = `${Namespace.EIP155}:1/invalid_asset_type:${validAddress}`
  const invalidAssetIdAddress = `${Namespace.EIP155}:1/erc1155:invalid_address`

  describe('safeParseAsset', () => {
    it('returns success for valid caip-19 id', () => {
      expect(safeParseAsset(validErc1155AssetId)).toEqual({
        success: true,
        value: {
          namespace: Namespace.EIP155,
          chainId: 1,
          assetType: AssetType.ERC1155,
          address: validAddress,
          assetId: undefined
        }
      })

      expect(safeParseAsset(validErc20AssetId)).toEqual({
        success: true,
        value: {
          namespace: Namespace.EIP155,
          chainId: 137,
          assetType: AssetType.ERC20,
          address: validAddress,
          assetId: undefined
        }
      })

      expect(safeParseAsset(validErc721CollectibleAssetId)).toEqual({
        success: true,
        value: {
          namespace: Namespace.EIP155,
          chainId: 1,
          assetType: AssetType.ERC721,
          address: validAddress,
          assetId: '999'
        }
      })
    })

    it('returns success for valid caip-20 id', () => {
      expect(safeParseAsset(validNativeCoin)).toEqual({
        success: true,
        value: {
          namespace: Namespace.EIP155,
          chainId: 1,
          assetType: AssetType.SLIP44,
          coinType: 60
        }
      })
    })

    it('returns error for invalid caip-19 id format', () => {
      expect(safeParseAsset(invalidAssetId)).toEqual({
        success: false,
        error: ErrorCode.INVALID_CAIP_19_FORMAT
      })
    })

    it('returns error for invalid namespace', () => {
      expect(safeParseAsset(invalidAssetIdNamespace)).toEqual({
        success: false,
        error: ErrorCode.INVALID_NAMESPACE
      })
    })

    it('returns error for invalid asset type', () => {
      expect(safeParseAsset(invalidAssetIdAssetType)).toEqual({
        success: false,
        error: ErrorCode.INVALID_CAIP_19_ASSET_TYPE
      })
    })

    it('returns error for invalid address', () => {
      expect(safeParseAsset(invalidAssetIdAddress)).toEqual({
        success: false,
        error: ErrorCode.INVALID_ADDRESS
      })
    })
  })

  describe('safeParseCoin', () => {
    it('returns success for valid caip-20 id', () => {
      expect(safeParseCoin(validNativeCoin)).toEqual({
        success: true,
        value: {
          namespace: Namespace.EIP155,
          chainId: 1,
          assetType: AssetType.SLIP44,
          coinType: 60
        }
      })
    })
  })

  describe('safeParseToken', () => {
    it('returns success for valid caip-19 id', () => {
      expect(safeParseToken(validErc20AssetId)).toEqual({
        success: true,
        value: {
          namespace: Namespace.EIP155,
          chainId: 137,
          assetType: AssetType.ERC20,
          address: validAddress,
          assetId: undefined
        }
      })
    })
  })

  describe('safeGetAssetId', () => {
    it('returns success for valid token caip-19 id', () => {
      expect(safeGetAssetId(validErc1155AssetId)).toEqual({
        success: true,
        value: validErc1155AssetId
      })
      expect(safeGetAssetId(validErc20AssetId)).toEqual({
        success: true,
        value: validErc20AssetId
      })
      expect(safeGetAssetId(validErc721CollectibleAssetId)).toEqual({
        success: true,
        value: validErc721CollectibleAssetId
      })
    })

    it('returns success for valid coin caip-20 id', () => {
      expect(safeGetAssetId(validNativeCoin)).toEqual({
        success: true,
        value: validNativeCoin
      })
    })

    it('returns error for invalid token caip-19 id format', () => {
      expect(safeGetAssetId(invalidAssetId)).toEqual({
        success: false,
        error: ErrorCode.INVALID_CAIP_19_FORMAT
      })
    })

    it('returns error for invalid namespace', () => {
      expect(safeGetAssetId(invalidAssetIdNamespace)).toEqual({
        success: false,
        error: ErrorCode.INVALID_NAMESPACE
      })
    })

    it('returns error for invalid asset type', () => {
      expect(safeGetAssetId(invalidAssetIdAssetType)).toEqual({
        success: false,
        error: ErrorCode.INVALID_CAIP_19_ASSET_TYPE
      })
    })

    it('returns error for invalid address', () => {
      expect(safeGetAssetId(invalidAssetIdAddress)).toEqual({
        success: false,
        error: ErrorCode.INVALID_ADDRESS
      })
    })
  })

  describe('getAssetId', () => {
    it('returns asset id for valid input', () => {
      expect(getAssetId(validErc1155AssetId)).toEqual(validErc1155AssetId)
      expect(getAssetId(validNativeCoin)).toEqual(validNativeCoin)
    })

    it('throws error for invalid input', () => {
      const invalidAssetId = 'invalid_caip19_id'
      expect(() => getAssetId(invalidAssetId)).toThrow(CaipError)
    })
  })

  describe('toAssetId', () => {
    const eth: Asset = {
      namespace: Namespace.EIP155,
      chainId: 1,
      assetType: AssetType.SLIP44,
      coinType: 60
    }

    const erc1155: Asset = {
      namespace: Namespace.EIP155,
      chainId: 1,
      assetType: AssetType.ERC1155,
      address: '0x1234567890abcdef'
    }

    const erc721: Asset = {
      namespace: Namespace.EIP155,
      chainId: 1,
      assetType: AssetType.ERC721,
      address: '0x1234567890abcdef',
      assetId: '999'
    }

    it('returns asset id for coin', () => {
      expect(toAssetId(eth)).toEqual(`${eth.namespace}:${eth.chainId}/${eth.assetType}:${eth.coinType}`)
    })

    it('returns asset id for erc1155 asset', () => {
      expect(toAssetId(erc1155)).toEqual(
        `${erc1155.namespace}:${erc1155.chainId}/${erc1155.assetType}:${erc1155.address}`
      )
    })

    it('returns asset id for erc721 asset', () => {
      expect(toAssetId(erc721)).toEqual(
        `${erc721.namespace}:${erc721.chainId}/${erc721.assetType}:${erc721.address}/${erc721.assetId}`
      )
    })
  })
})
