import { AssetTypeEnum, Intents } from './domain'
import { Intent } from './intent.types'

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
  | {
      type: Intents.TRANSFER_ERC1155
      validatedFields: TransferIntent
    }
  | {
      type: Intents.TRANSFER_NATIVE
      validatedFields: TransferIntent
    }
  | {
      type: Intents.CALL_CONTRACT
      validatedFields: TransferIntent
    }
)

type DecodeSuccess = {
  success: true
  intent: Intent
}

type DecodeError = {
  success: false
  error: {
    message: string
    status: number
    context: Record<string, unknown>
  }
}

export type Decode = DecodeSuccess | DecodeError
