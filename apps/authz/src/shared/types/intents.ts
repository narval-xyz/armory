import { AddressBookAccount, Wallet } from './entities.types'
import { Intents } from './enums'

// Here define the types for Spending Limits that will be added to the concerned Transfer types.
// Also, need to enrich with thirdparties metadata such as usd prices, rates..

type Caip10 = string
type Caip19 = string

export type NativeId = Caip10 | AddressBookAccount
export type TokenId = Caip10 | AddressBookAccount
export type NftId = Caip19

export type ContractFunction = {
  hexSignature: string
}

export type TransferNative = {
  type: Intents.TRANSFER_NATIVE
  from: AddressBookAccount | Wallet
  to: AddressBookAccount | Wallet
  amount: string
  native: NativeId
}

export type TransferToken = {
  type: Intents.TRANSFER_TOKEN
  from: AddressBookAccount | Wallet
  to: AddressBookAccount | Wallet
  amount: string
  token: TokenId
}

export type TransferNft = {
  type: Intents.TRANSFER_NFT
  from: AddressBookAccount | Wallet
  to: AddressBookAccount | Wallet
  amount: string // will default from 1
  nftId: NftId
  nftContract: AddressBookAccount
}

export type CallContract = {
  type: Intents.CALL_CONTRACT
  from: AddressBookAccount | Wallet
  to: AddressBookAccount | Wallet
  call: ContractFunction
}

export type Intent = TransferNative | TransferToken | TransferNft | CallContract
