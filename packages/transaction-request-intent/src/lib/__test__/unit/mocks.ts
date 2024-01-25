import { TransactionRequest } from '@narval/authz-shared'
import { Address } from 'viem'
import { Caip10, Caip19 } from '../../caip'
import { DecodeInput, InputType, Intents, TransactionInput } from '../../domain'
import { TransferErc1155, TransferErc20, TransferErc721, TransferNative } from '../../intent.types'

export const ONE_ETH = BigInt('1000000000000000000')

export const USDC_TOKEN = {
  uid: 'eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  symbol: 'USDC',
  chain_id: 137,
  decimals: 6
}

type UUID = string

// ENTITIES: user, user group, wallet, wallet group, and address book.
export type User = {
  uid: string // Pubkey
  role: UserRoles
}

export type UserGroup = {
  uid: string
  name: string
  users: string[] // userIds
}

export type Wallet = {
  uid: string
  address: string
  accountType: AccountType
  chainId?: number
  assignees?: string[] // userIds
}

export type WalletGroup = {
  uid: string
  name: string
  wallets: string[] // walletIds
}

export type AddressBookAccount = {
  uid: string
  address: string
  chainId: number
  classification: string
}

export type AddressBook = {
  orgId: UUID
  name: string
  accounts: AddressBookAccount[]
}

export type RolePermission = {
  permit: boolean
  admin_quorum_threshold?: number
}

export type RegoData = {
  entities: {
    users: Record<string, User>
    user_groups: Record<string, UserGroup>
    wallets: Record<string, Wallet>
    wallet_groups: Record<string, WalletGroup>
    address_book: Record<string, AddressBookAccount>
  }
  permissions: Record<string, Record<string, RolePermission>>
}

export enum AccountType {
  EOA = 'eoa',
  AA = '4337'
}

export enum UserRoles {
  ROOT = 'root',
  ADMIN = 'admin',
  MEMBER = 'member',
  MANAGER = 'manager'
}
// Note: Action is a shared enum w/ every other module
export enum Action {
  // Resource Actions
  CREATE_USER = 'user:create',
  EDIT_USER = 'user:edit',
  DELETE_USER = 'user:delete',
  CHANGE_USER_ROLE = 'user:change-role',
  CREATE_WALLET = 'wallet:create',
  EDIT_WALLET = 'wallet:edit',
  ASSIGN_WALLET = 'wallet:assign',
  UNASSIGN_WALLET = 'wallet:unassign',
  CREATE_USER_GROUP = 'user-group:create',
  EDIT_USER_GROUP = 'user-group:edit',
  DELETE_USER_GROUP = 'user-group:delete',
  CREATE_WALLET_GROUP = 'wallet-group:create',
  EDIT_WALLET_GROUP = 'wallet-group:edit',
  DELETE_WALLET_GROUP = 'wallet-group:delete',

  // Policy Management Actions
  SET_POLICY_RULES = 'setPolicyRules',

  // Wallet Actions
  SIGN_TRANSACTION = 'signTransaction',
  SIGN_RAW = 'signRaw',
  SIGN_MESSAGE = 'signMessage',
  SIGN_TYPED_DATA = 'signTypedData'
}

/**
 * User & User Groups
 */

export const ROOT_USER = {
  uid: 'u:root_user',
  role: UserRoles.ROOT
}

export const MATT: User = {
  uid: 'matt@narval.xyz',
  role: UserRoles.ADMIN
}

export const AAUser: User = {
  uid: 'aa@narval.xyz',
  role: UserRoles.ADMIN
}

export const BBUser: User = {
  uid: 'bb@narval.xyz',
  role: UserRoles.ADMIN
}

export const DEV_USER_GROUP: UserGroup = {
  uid: 'ug:dev-group',
  name: 'Dev',
  users: [MATT.uid]
}

export const TREASURY_USER_GROUP: UserGroup = {
  uid: 'ug:treasury-group',
  name: 'Treasury',
  users: [BBUser.uid, MATT.uid]
}

/**
 * User<>Authn mapping store
 */

// Private keys used for USER AUTHN; these are _not_ "wallets" in our system.
export const UNSAFE_PRIVATE_KEY_MATT = '0x5f1049fa330544680cfa495285000d7a597adae224c070ccb9f1dc2d5f9204d1' // 0xd75D626a116D4a1959fE3bB938B2e7c116A05890
export const UNSAFE_PRIVATE_KEY_AAUSER = '0x2f069925bbd2bc2a9fddeab641dea34f7893dd97013cd6282909897740e07539' // 0x501D5c2Ce1EF208aadf9131a98BAa593258CfA06
export const UNSAFE_PRIVATE_KEY_BBUSER = '0xa1f1830a6d1765aa1b57ad76731d1c3463658523e11dc853b7af7827549096c3' // 0xab88c8785D0C00082dE75D801Fcb1d5066a6311e

// User AuthN Address <> UserId mapping; one user can  have multiple authn pubkeys
export const userAddressStore: { [key: string]: string } = {
  '0xd75D626a116D4a1959fE3bB938B2e7c116A05890': MATT.uid,
  '0x501D5c2Ce1EF208aadf9131a98BAa593258CfA06': AAUser.uid,
  '0xab88c8785D0C00082dE75D801Fcb1d5066a6311e': BBUser.uid
}

/**
 * Wallet & Wallet Groups & Accounts
 */

// Wallets
export const SHY_ACCOUNT_WALLET: Wallet = {
  uid: 'eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e',
  address: '0xddcf208f219a6e6af072f2cfdc615b2c1805f98e',
  accountType: AccountType.EOA,
  assignees: [MATT.uid]
}

export const PIERRE_WALLET: Wallet = {
  uid: 'eip155:eoa:0x22228d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
  address: '0x22228d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
  accountType: AccountType.EOA
}

export const WALLET_Q: Wallet = {
  uid: 'eip155:eoa:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
  address: '0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
  accountType: AccountType.EOA,
  assignees: [MATT.uid]
}

export const TREASURY_WALLET_X: Wallet = {
  uid: 'eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b', // Prod guild 58 - treasury wallet
  address: '0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
  accountType: AccountType.EOA,
  assignees: []
}

// Wallet Groups

export const DEV_WALLET_GROUP: WalletGroup = {
  uid: 'wg:dev-group',
  name: 'Dev',
  wallets: [SHY_ACCOUNT_WALLET.uid]
}

export const TREASURY_WALLET_GROUP: WalletGroup = {
  uid: 'wg:treasury-group',
  name: 'Treasury',
  wallets: [TREASURY_WALLET_X.uid]
}

// Address Book

export const SHY_ACCOUNT_137: AddressBookAccount = {
  uid: 'eip155:137:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e',
  address: '0xddcf208f219a6e6af072f2cfdc615b2c1805f98e',
  chainId: 137,
  classification: 'wallet'
}

export const SHY_ACCOUNT_1: AddressBookAccount = {
  uid: 'eip155:1:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e',
  address: '0xddcf208f219a6e6af072f2cfdc615b2c1805f98e',
  chainId: 1,
  classification: 'wallet'
}

export const ACCOUNT_Q_137: AddressBookAccount = {
  uid: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
  address: '0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
  chainId: 137,
  classification: 'wallet'
}

export const ACCOUNT_INTERNAL_WXZ_137: AddressBookAccount = {
  uid: 'eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3',
  address: '0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3',
  chainId: 137,
  classification: 'internal'
}

export const NATIVE_TRANSFER_INTENT: TransferNative = {
  type: Intents.TRANSFER_NATIVE,
  to: 'eip155:137/eoa:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4' as Caip10,
  from: 'eip155:137/eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b' as Caip10,
  amount: '0x8000',
  token: 'eip155:1/slip44/60' as Caip19 // Caip19 for ETH
}

const ERC20_TRANSFER_TX_REQUEST: TransactionRequest = {
  from: TREASURY_WALLET_X.address as Address,
  to: '0x031d8C0cA142921c459bCB28104c0FF37928F9eD' as Address,
  chainId: ACCOUNT_Q_137.chainId,
  data: '0xa9059cbb000000000000000000000000031d8c0ca142921c459bcb28104c0ff37928f9ed000000000000000000000000000000000000000000005ab7f55035d1e7b4fe6d',
  nonce: 192,
  type: '2'
}

const ERC20_TRANSFER_INTENT: TransferErc20 = {
  type: Intents.TRANSFER_ERC20,
  to: `eip155:137:0x031d8c0ca142921c459bcb28104c0ff37928f9ed` as Caip10,
  from: `eip155:137:${ERC20_TRANSFER_TX_REQUEST.from.toLowerCase()}` as Caip10,
  contract: `eip155:137:${ERC20_TRANSFER_TX_REQUEST.to?.toLowerCase()}` as Caip10,
  amount: '428406414311469998210669'
}

const ERC721_SAFE_TRANSFER_FROM_TX_REQUEST: TransactionRequest = {
  from: TREASURY_WALLET_X.address as Address,
  to: ACCOUNT_Q_137.address as Address,
  chainId: ACCOUNT_Q_137.chainId,
  data: '0x42842e0e000000000000000000000000ea7278a0d8306658dd6d38274dde084f24cd8a11000000000000000000000000b253f6156e64b12ba0dec3974062dbbaee139f0c000000000000000000000000000000000000000000000000000000000000a0d5',
  nonce: 192,
  type: '2'
}

const ERC721_SAFE_TRANSFER_FROM_INTENT: TransferErc721 = {
  type: Intents.TRANSFER_ERC721,
  to: `eip155:137:0xb253f6156e64b12ba0dec3974062dbbaee139f0c` as Caip10,
  from: `eip155:137:${ERC721_SAFE_TRANSFER_FROM_TX_REQUEST.from.toLowerCase()}` as Caip10,
  contract: `eip155:137:${ERC721_SAFE_TRANSFER_FROM_TX_REQUEST.to?.toLowerCase()}` as Caip10,
  nftId: `eip155:137/erc721:${ERC721_SAFE_TRANSFER_FROM_TX_REQUEST.to}/41173` as Caip19
}

export const mockErc721SafeTransferFrom = {
  input: {
    type: InputType.TRANSACTION_REQUEST,
    txRequest: ERC721_SAFE_TRANSFER_FROM_TX_REQUEST
  } as TransactionInput,
  intent: ERC721_SAFE_TRANSFER_FROM_INTENT
}

const transferFromData =
  '0x23b872dd000000000000000000000000ce5550ac05e0c6ab27418de56fc57c852de961d400000000000000000000000059895c2cdaa07cc3ac20ef0918d2597a277b276c000000000000000000000000000000000000000000000000000000000000159c'

export const mockTransferFrom = {
  input: {
    type: InputType.TRANSACTION_REQUEST,
    txRequest: {
      from: TREASURY_WALLET_X.address as Address,
      to: ACCOUNT_Q_137.address as Address,
      chainId: ACCOUNT_Q_137.chainId,
      data: transferFromData,
      nonce: 192,
      type: '2'
    }
  } as TransactionInput,
  intent: {
    to: `eip155:137:0x59895c2cdaa07cc3ac20ef0918d2597a277b276c` as Caip10,
    from: `eip155:137:${TREASURY_WALLET_X.address}` as Caip10,
    contract: `eip155:137:${ACCOUNT_Q_137.address}` as Caip10,
    amount: '5532'
  }
}

const ERC1155_SAFE_TRANSFER_FROM_TX_REQUEST: TransactionRequest = {
  from: TREASURY_WALLET_X.address as Address,
  to: ACCOUNT_Q_137.address as Address,
  chainId: ACCOUNT_Q_137.chainId,
  data: '0xf242432a000000000000000000000000d15b4cb5495cffa8d01970018ea3bc4942e34b7a00000000000000000000000000ca04c45da318d5b7e7b14d5381ca59f09c73f000000000000000000000000000000000000000000000000000000000000000af000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000704760f2a0b00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000ca04c45da318d5b7e7b14d5381ca59f09c73f00000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006042b8a88ec00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000005c0000000000000000000000000d15b4cb5495cffa8d01970018ea3bc4942e34b7a000000000000000000000000d15b4cb5495cffa8d01970018ea3bc4942e34b7a000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000005e000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000046000000000000000000000000000000000000000000000000000000000000004e0000000000000000000000000cb02f88ea1b95ba4adccfc0d0ac2a6052b70f2e400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000022000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000065a9d6a20000000000000000000000000000000000000000000000000000000065adcb5d000000000000000000000000000000000000000000000000000000000000000060665ba51d4da48b00000000000000004cb15528fa439a0e4e2a583202e926d50000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f00000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf127000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000024b2b50d4fec700000000000000000000000000000000000000000000000000024b2b50d4fec7000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003000000000000000000000000939821fd096b4e4f67f369af67cf9411b1a2816000000000000000000000000000000000000000000000000000000000000000af00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000cb02f88ea1b95ba4adccfc0d0ac2a6052b70f2e400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000d500b1d8e8ef31e21c99d1db9a6444d3adf127000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001d5bc40aa656c0000000000000000000000000000000000000000000000000001d5bc40aa656c00000000000000000000000000001f429aa3c402e9deabe8a8ecae7d37b0d35452c0000000000000000000000000000000000000000000000000000000000000041efa2557bc958943cb6a7df19ae9c8b1b516515b5184f21516458a44d559141d94229134f3da4243b36151bba8cc65bf4d441a277326a87e59b1b5dcb18c681021b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001d4da48b60665ba5',
  nonce: 192,
  type: '2'
}

const ERC1155_SAFE_TRANSFER_FROM_INTENT: TransferErc1155 = {
  type: Intents.TRANSFER_ERC1155,
  to: `eip155:137:0x00ca04c45da318d5b7e7b14d5381ca59f09c73f0` as Caip10,
  from: `eip155:137:${ERC1155_SAFE_TRANSFER_FROM_TX_REQUEST.from.toLowerCase()}` as Caip10,
  contract: `eip155:137:${ERC1155_SAFE_TRANSFER_FROM_TX_REQUEST.to?.toLowerCase()}` as Caip10,
  transfers: [{ tokenId: `eip155:137/erc1155:${ERC1155_SAFE_TRANSFER_FROM_TX_REQUEST.to}/175` as Caip19, amount: '1' }]
}
export const mockErc1155SafeTransferFrom = {
  input: {
    type: InputType.TRANSACTION_REQUEST,
    txRequest: ERC1155_SAFE_TRANSFER_FROM_TX_REQUEST
  } as TransactionInput,
  intent: ERC1155_SAFE_TRANSFER_FROM_INTENT
}

const ERC1155_BATCH_SAFE_TRANSFER_FROM_REQUEST = {
  from: TREASURY_WALLET_X.address as Address,
  to: ACCOUNT_Q_137.address as Address,
  chainId: ACCOUNT_Q_137.chainId,
  data: '0x2eb2c2d60000000000000000000000008b149b00ce4ad98878ec342d69eb42dcbcbd6306000000000000000000000000383370726a5bd619e0d2af8ef37a58013b823a8c00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000b9c00000000000000000000000000000000000000000000000000000000000000a200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000610000000000000000000000000000000000000000000000000000000065a9d9340feb2529261db182817eef5823d8f659495e6bdc097b95cac8011dd73a13be723d4c281943fbfff8b8ba89cfa2a44286411e94e8eb9601502914ffd41764bc781c00000000000000000000000000000000000000000000000000000000000000',
  nonce: 2
}

const ERC1155_BATCH_SAFE_TRANSFER_FROM_INTENT = {
  type: Intents.TRANSFER_ERC1155,
  from: `eip155:137:${ERC1155_BATCH_SAFE_TRANSFER_FROM_REQUEST.from.toLowerCase()}` as Caip10,
  to: `eip155:137:0x383370726a5bd619e0d2af8ef37a58013b823a8c` as Caip10,
  contract: `eip155:137:${ERC1155_BATCH_SAFE_TRANSFER_FROM_REQUEST.to?.toLowerCase()}` as Caip10,
  transfers: [
    {
      tokenId: `eip155:137/erc1155:${ERC1155_BATCH_SAFE_TRANSFER_FROM_REQUEST.to}/2972` as Caip19,
      amount: '1'
    },
    {
      tokenId: `eip155:137/erc1155:${ERC1155_BATCH_SAFE_TRANSFER_FROM_REQUEST.to}/162` as Caip19,
      amount: '1'
    }
  ]
}

export const mockErc1155BatchSafeTransferFrom = {
  input: {
    type: InputType.TRANSACTION_REQUEST,
    txRequest: ERC1155_BATCH_SAFE_TRANSFER_FROM_REQUEST
  } as TransactionInput,
  intent: ERC1155_BATCH_SAFE_TRANSFER_FROM_INTENT
}

export const mockErc20Transfer = {
  input: {
    type: InputType.TRANSACTION_REQUEST,
    txRequest: ERC20_TRANSFER_TX_REQUEST
  } as TransactionInput,
  intent: ERC20_TRANSFER_INTENT
}

export const mockCancelTransaction: DecodeInput = {
  type: InputType.TRANSACTION_REQUEST,
  txRequest: {
    chainId: 1,
    value: '0x',
    to: ACCOUNT_Q_137.address as Address,
    from: ACCOUNT_Q_137.address as Address
  }
}
