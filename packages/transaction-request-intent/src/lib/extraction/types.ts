import { Hex } from 'viem'

export type Erc721SafeTransferFromParams = {
  from: Hex
  to: Hex
  tokenId: string
}

export type Erc1155SafeTransferFromParams = {
  from: Hex
  to: Hex
  tokenId: string
  amount: string
  data: Hex
}

export type TransferParams = {
  recipient: Hex
  amount: string
}

export type TransferFromParams = {
  sender: Hex
  recipient: Hex
  amount: string
}

export type SafeBatchTransferFromParams = {
  from: Hex
  to: Hex
  tokenIds: string[]
  amounts: string[]
  data: Hex
}

export type NullHexParams = Record<string, never>

export type ExtractedParams =
  | Erc721SafeTransferFromParams
  | TransferParams
  | TransferFromParams
  | Erc1155SafeTransferFromParams
  | SafeBatchTransferFromParams
  | NullHexParams
