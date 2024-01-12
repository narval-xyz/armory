import {
  AddressBookAccount,
  RegoData,
  RolePermission,
  User,
  UserGroup,
  Wallet,
  WalletGroup
} from '@app/authz/shared/types/entities.types'
import { AccountType, BlockchainActions, ResourceActions, UserRoles } from '@app/authz/shared/types/enums'
import { TransactionRequest } from '@app/authz/shared/types/http'
import { RegoInput } from '@app/authz/shared/types/rego'
import { Caip19 } from 'packages/transaction-request-intent/src/lib/caip'
import { Intents } from 'packages/transaction-request-intent/src/lib/domain'
import { TransferNative } from 'packages/transaction-request-intent/src/lib/intent.types'
import { Address, toHex } from 'viem'

export const ONE_ETH = BigInt('1000000000000000000')

export const USDC_TOKEN = {
  uid: 'eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
  symbol: 'USDC',
  chain_id: 137,
  decimals: 6
}

/**
 * User & User Groups
 */

export const ROOT_USER: User = {
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
  chainId: '137',
  classification: 'wallet'
}

export const SHY_ACCOUNT_1: AddressBookAccount = {
  uid: 'eip155:1:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e',
  address: '0xddcf208f219a6e6af072f2cfdc615b2c1805f98e',
  chainId: '1',
  classification: 'wallet'
}

export const ACCOUNT_Q_137: AddressBookAccount = {
  uid: 'eip155:137:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
  address: '0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
  chainId: '137',
  classification: 'wallet'
}

export const ACCOUNT_INTERNAL_WXZ_137: AddressBookAccount = {
  uid: 'eip155:137:0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3',
  address: '0xa45e21e9370ba031c5e1f47dedca74a7ce2ed7a3',
  chainId: '137',
  classification: 'internal'
}

export const NATIVE_TRANSFER_INTENT: TransferNative = {
  type: Intents.TRANSFER_NATIVE,
  amount: toHex(ONE_ETH),
  native: 'eip155:1/slip44:60' as Caip19 // Caip19 for ETH
}

export const ERC20_TRANSFER_TX_REQUEST: TransactionRequest = {
  from: TREASURY_WALLET_X.address as Address,
  to: '0x031d8C0cA142921c459bCB28104c0FF37928F9eD' as Address,
  chainId: ACCOUNT_Q_137.chainId,
  data: '0xa9059cbb000000000000000000000000031d8c0ca142921c459bcb28104c0ff37928f9ed000000000000000000000000000000000000000000005ab7f55035d1e7b4fe6d',
  nonce: 192,
  type: '2'
}

export const NATIVE_TRANSFER_TX_REQUEST: TransactionRequest = {
  from: TREASURY_WALLET_X.address as Address,
  to: ACCOUNT_Q_137.address as Address,
  chainId: ACCOUNT_Q_137.chainId,
  value: toHex(ONE_ETH),
  data: '0x',
  nonce: 192,
  type: '2'
}

export const REGO_REQUEST: RegoInput = {
  activityType: BlockchainActions.SIGN_TRANSACTION,
  request: NATIVE_TRANSFER_TX_REQUEST,
  intent: NATIVE_TRANSFER_INTENT,
  resource: {
    uid: TREASURY_WALLET_X.uid
  },
  principal: {
    uid: MATT.uid
  },
  signatures: []
}

// Role Permissions
// Of course we can have different permissions per resource, but for now we'll just use the same permissions for all resources.

export const ROOT_PERMISSIONS: RolePermission = {
  permit: true
}

export const ADMIN_PERMISSIONS: RolePermission = {
  permit: true,
  admin_quorum_threshold: 1
}

export const MANAGER_PERMISSIONS: RolePermission = {
  permit: true,
  admin_quorum_threshold: 2
}

export const mockEntityData: RegoData = {
  entities: {
    users: {
      [ROOT_USER.uid]: ROOT_USER,
      [MATT.uid]: MATT,
      [AAUser.uid]: AAUser,
      [BBUser.uid]: BBUser
    },
    user_groups: {
      [DEV_USER_GROUP.uid]: DEV_USER_GROUP,
      [TREASURY_USER_GROUP.uid]: TREASURY_USER_GROUP
    },
    wallets: {
      [SHY_ACCOUNT_WALLET.uid]: SHY_ACCOUNT_WALLET,
      [PIERRE_WALLET.uid]: PIERRE_WALLET,
      [WALLET_Q.uid]: WALLET_Q,
      [TREASURY_WALLET_X.uid]: TREASURY_WALLET_X
    },
    wallet_groups: {
      [DEV_WALLET_GROUP.uid]: DEV_WALLET_GROUP,
      [TREASURY_WALLET_GROUP.uid]: TREASURY_WALLET_GROUP
    },
    address_book: {
      [SHY_ACCOUNT_137.uid]: SHY_ACCOUNT_137,
      [SHY_ACCOUNT_1.uid]: SHY_ACCOUNT_1,
      [ACCOUNT_INTERNAL_WXZ_137.uid]: ACCOUNT_INTERNAL_WXZ_137,
      [ACCOUNT_Q_137.uid]: ACCOUNT_Q_137
    }
  },
  permissions: {
    [ResourceActions.CREATE_USER]: {
      [UserRoles.ROOT]: ROOT_PERMISSIONS,
      [UserRoles.ADMIN]: ADMIN_PERMISSIONS
    },
    [ResourceActions.EDIT_USER]: {
      [UserRoles.ROOT]: ROOT_PERMISSIONS,
      [UserRoles.ADMIN]: ADMIN_PERMISSIONS
    },
    [ResourceActions.DELETE_USER]: {
      [UserRoles.ROOT]: ROOT_PERMISSIONS,
      [UserRoles.ADMIN]: ADMIN_PERMISSIONS
    },
    [ResourceActions.CREATE_WALLET]: {
      [UserRoles.ROOT]: ROOT_PERMISSIONS
    },
    [ResourceActions.EDIT_WALLET]: {
      [UserRoles.ROOT]: ROOT_PERMISSIONS,
      [UserRoles.MANAGER]: MANAGER_PERMISSIONS
    },
    [ResourceActions.ASSIGN_WALLET]: {
      [UserRoles.ROOT]: ROOT_PERMISSIONS,
      [UserRoles.MANAGER]: MANAGER_PERMISSIONS
    },
    [ResourceActions.UNASSIGN_WALLET]: {
      [UserRoles.ROOT]: ROOT_PERMISSIONS,
      [UserRoles.MANAGER]: MANAGER_PERMISSIONS
    }
  }
}
