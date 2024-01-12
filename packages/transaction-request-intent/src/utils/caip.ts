import { AccountId, AssetId } from 'caip'
import { SetOptional } from 'type-fest'
import { Address } from 'viem'
import { AssetTypeEnum, EipStandardEnum } from './domain'

export type Caip10 = string & { readonly brand: unique symbol }

export type Caip19 = string & { readonly brand: unique symbol }

export type Caip10Standards = {
  chainId: number | 'eoa'
  evmAccountAddress: Address
  eipStandard: EipStandardEnum
}

export type Caip19Standards = Caip10Standards & {
  tokenId: string
  assetType: AssetTypeEnum
}

export const encodeEoaAccountId = ({
  chainId,
  evmAccountAddress,
  eipStandard = EipStandardEnum.EIP155
}: SetOptional<Caip10Standards, 'eipStandard'>): Caip10 =>
  new AccountId({
    chainId: { namespace: eipStandard, reference: chainId.toString() },
    address: evmAccountAddress.toLowerCase()
  })
    .toString()
    .toLowerCase() as Caip10

export const encodeEoaAssetId = ({
  chainId,
  evmAccountAddress,
  eipStandard = EipStandardEnum.EIP155,
  tokenId,
  assetType
}: Caip19Standards): Caip19 =>
  new AssetId({
    chainId: { namespace: eipStandard, reference: chainId.toString() },
    assetName: {
      namespace: assetType,
      reference: evmAccountAddress
    },
    tokenId
  })
    .toString()
    .toLowerCase() as Caip19
