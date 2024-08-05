# Policy Engine Shared

This library contains the shared kernel like types and utility functions of the
Policy Engine application.

## Testing

```bash
 make policy-engine-shared/test/unit
 make policy-engine-shared/test/unit/watch
```

## Formatting

```bash
make policy-engine-shared/format
make policy-engine-shared/lint

make policy-engine-shared/format/check
make policy-engine-shared/lint/check
```

## Account & Asset ID API (CAIP-10/19)

You can find a CAIP-10/19 implementation to what concerns Narval domain at
[caip.util.ts](packages/policy-engine-shared/src/lib/util/caip.util.ts).

> For more complete examples, please check
> [caip.util.spec.ts](packages/policy-engine-shared/src/lib/util/__test__/unit/caip.util.spec.ts).

API for [CAIP-10 Account ID
Specification](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md).

> [!IMPORTANT]
> Unsafe operations will throw CaipError.

```typescript
getChainAccountId('eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4')
parseChainAccount('eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4')

// Safe operations
toChainAccountId(account)
safeGetChainAccountId('eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4')
safeParseChainAccount('eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4')
```

API for [CAIP-19 Asset ID
Specification](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-19.md).

```typescript
getAssetId('eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f')
// In CAIP-19, an Asset is either a Token or a Coin. You can get the union type
// or opt for a more specific type.
parseAsset('eip155:1/erc721:0x06012c8cf97BEaD5deAe237070F9587f8E7A266d/771769')
parseAsset('eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f')
parseAsset('eip155:1/slip44:60')
parseCoin('eip155:1/slip44:60')
parseToken('eip155:1/erc721:0x06012c8cf97BEaD5deAe237070F9587f8E7A266d/771769')

// Safe operations
toAssetId(asset)
safeGetAssetId('eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f')
safeParseAsset('eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f')
safeParseToken('eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f')
safeParseCoin('eip155:1/slip44:60')
```

### Reference

- https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md
- https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-19.md
- https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-20.md
- https://github.com/satoshilabs/slips/blob/master/slip-0044.md
