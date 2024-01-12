import { Caip10, Caip19 } from './caip'
import { AssetTypeEnum, Intents, TransactionStatus } from './domain'
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

enum ContractStandard {
  ERC20 = 'erc20',
  ERC721 = 'erc721',
  ERC1155 = 'erc1155',
  UNKNOWN = 'unknown'
}

type Contract =
  | {
      standard: ContractStandard.ERC20
    }
  | {
      standard: ContractStandard.ERC721
    }
  | {
      standard: ContractStandard.ERC1155
      tokenIds: Caip19[]
      nftIds: Caip19[]
    }

export type ContractRegistry = {
  [key: Caip10]: Contract
}

export type TransactionRegistry = {
  [key: string]: TransactionStatus // Append from and nonce for key
}
