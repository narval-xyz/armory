import {
  AssetType,
  Caip10Id,
  Caip19Id,
  Namespace,
  ParseError,
  parseCaip10,
  parseCaip19,
  toCaip10,
  toCaip19
} from '../../caip.util'

describe('caip', () => {
  const validAddress = '0x5db3Bf14413d7e3c69FAA279EFa1D1B08637eC4c'

  describe('parseCaip10', () => {
    it('returns success for valid CAIP-10 ID', () => {
      const caip10Id: Caip10Id = `${Namespace.EIP155}:1/${validAddress}`

      expect(parseCaip10(caip10Id)).toEqual({
        success: true,
        value: {
          namespace: Namespace.EIP155,
          chainId: 1,
          address: validAddress
        }
      })
    })

    it('returns error for invalid CAIP-10 ID format', () => {
      const caip10Id: Caip10Id = 'invalid_caip10_id' as Caip10Id
      const result = parseCaip10(caip10Id)

      expect(result.success).toEqual(false)

      if (!result.success) {
        expect(result.error).toEqual(ParseError.INVALID_CAIP_10_FORMAT)
      }
    })

    it('returns error for invalid namespace', () => {
      const caip10Id: Caip10Id = 'invalid_namespace:1/0x1234567890abcdef' as Caip10Id
      const result = parseCaip10(caip10Id)

      expect(result.success).toEqual(false)

      if (!result.success) {
        expect(result.error).toEqual(ParseError.INVALID_NAMESPACE)
      }
    })

    it('returns error for invalid address', () => {
      const caip10Id: Caip10Id = `${Namespace.EIP155}:1/invalid_address`
      const result = parseCaip10(caip10Id)

      expect(result.success).toEqual(false)

      if (!result.success) {
        expect(result.error).toEqual(ParseError.INVALID_ADDRESS)
      }
    })
  })

  describe('toCaip10', () => {
    it('converts Caip10 to ID', () => {
      expect(
        toCaip10({
          namespace: Namespace.EIP155,
          chainId: 1,
          address: '0x1234567890abcdef'
        })
      ).toEqual(`${Namespace.EIP155}:1/0x1234567890abcdef`)
    })
  })

  describe('parseCaip19', () => {
    it('returns success for valid CAIP-19 ID', () => {
      expect(parseCaip19(`${Namespace.EIP155}:1/${AssetType.ERC1155}:${validAddress}`)).toEqual({
        success: true,
        value: {
          namespace: Namespace.EIP155,
          chainId: 1,
          assetType: AssetType.ERC1155,
          address: validAddress
        }
      })
      expect(parseCaip19(`${Namespace.EIP155}:137/${AssetType.ERC20}:${validAddress}`)).toEqual({
        success: true,
        value: {
          namespace: Namespace.EIP155,
          chainId: 137,
          assetType: AssetType.ERC20,
          address: validAddress
        }
      })
    })

    it('returns success for valid CAIP-19 ID with assetId', () => {
      const result = parseCaip19(`${Namespace.EIP155}:1/${AssetType.ERC1155}:${validAddress}/999`)

      expect(result).toEqual({
        success: true,
        value: {
          namespace: Namespace.EIP155,
          chainId: 1,
          assetType: AssetType.ERC1155,
          address: validAddress,
          assetId: '999'
        }
      })
    })

    it('returns error for invalid CAIP-19 ID format', () => {
      const result = parseCaip19('invalid_caip19_id' as Caip19Id)

      expect(result).toEqual({
        success: false,
        error: ParseError.INVALID_CAIP_19_FORMAT
      })
    })

    it('returns error for invalid namespace', () => {
      const result = parseCaip19(`invalid_namespace:1/erc1155:${validAddress}` as Caip19Id)

      expect(result).toEqual({
        success: false,
        error: ParseError.INVALID_NAMESPACE
      })
    })

    it('returns error for invalid asset type', () => {
      const result = parseCaip19(`${Namespace.EIP155}:1/invalid_asset_type:${validAddress}` as Caip19Id)

      expect(result).toEqual({
        success: false,
        error: ParseError.INVALID_CAIP_19_ASSET_TYPE
      })
    })

    it('returns error for invalid address', () => {
      const result = parseCaip19(`${Namespace.EIP155}:1/erc1155:invalid_address`)

      expect(result).toEqual({
        success: false,
        error: ParseError.INVALID_ADDRESS
      })
    })
  })

  describe('toCaip19', () => {
    it('converts Caip19 object to Caip19Id', () => {
      expect(
        toCaip19({
          namespace: Namespace.EIP155,
          chainId: 1,
          assetType: AssetType.ERC1155,
          address: validAddress
        })
      ).toEqual(`${Namespace.EIP155}:1/${AssetType.ERC1155}:${validAddress}`)
    })

    it('converts Caip19 object with assetId to Caip19Id', () => {
      expect(
        toCaip19({
          namespace: Namespace.EIP155,
          chainId: 1,
          assetType: AssetType.ERC1155,
          address: validAddress,
          assetId: '999'
        })
      ).toEqual(`${Namespace.EIP155}:1/${AssetType.ERC1155}:${validAddress}/999`)
    })
  })
})
