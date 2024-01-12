import { AssetTypeEnum, Intents } from '../utils/domain'

export type TransferIntent = {
  data: `0x${string}`
  to: `0x${string}`
  chainId: string
}

export type IntentRequest = {
  methodId: string
  assetType: AssetTypeEnum
} & (
  | {
      type: Intents.TRANSFER_ERC20
      validatedFields: TransferIntent
    }
  | {
      type: Intents.TRANSFER_ERC721
      validatedFields: TransferIntent
    }
)
