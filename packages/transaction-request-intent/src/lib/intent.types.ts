import { Caip10, Caip19 } from './caip'
import { Intents } from './domain'

export type ContractFunction = {
  hexSignature: string
}

export type TransferNative = {
  type: Intents.TRANSFER_NATIVE
  amount: string
  native: Caip19
}

export type TransferErc20 = {
  type: Intents.TRANSFER_ERC20
  amount: string
  token: Caip10
}

export type TransferErc721 = {
  type: Intents.TRANSFER_ERC721
  nftId: Caip19
  nftContract: Caip10
}

// --> Handle rules for ERC1155 like
// - allow only non-fungible transfers up to x
// - allow only fungible transfers

export type TransferErc1155 = {
  type: Intents.TRANSFER_ERC1155
  nftContract: Caip10
  fungibleTransfers: Omit<TransferErc20, 'type'>[]
  nonFungibleTransfers: Omit<TransferErc721, 'type'>[]
}

export type CallContract = {
  type: Intents.CALL_CONTRACT
  call: ContractFunction
}

export type Intent = TransferNative | TransferErc20 | TransferErc721 | CallContract
