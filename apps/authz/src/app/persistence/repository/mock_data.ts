import { AccountType, AuthCredential, RegoInput, UserRoles } from '@app/authz/shared/types/domain.type'
import {
  AddressBookAccount,
  RegoData,
  User,
  UserGroup,
  Wallet,
  WalletGroup
} from '@app/authz/shared/types/entities.types'
import {
  AccountId,
  Action,
  Alg,
  AssetId,
  EvaluationRequest,
  Request,
  TransactionRequest,
  hashRequest
} from '@narval/authz-shared'
import { Intents } from 'packages/transaction-request-intent/src/lib/domain'
import { TransferNative } from 'packages/transaction-request-intent/src/lib/intent.types'
import { Address, toHex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

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

export const MATT_CREDENTIAL_1: AuthCredential = {
  alg: Alg.ES256K,
  userId: MATT.uid,
  pubKey: '0xd75D626a116D4a1959fE3bB938B2e7c116A05890'
}

export const AAUser: User = {
  uid: 'aa@narval.xyz',
  role: UserRoles.ADMIN
}

export const AAUser_Credential_1: AuthCredential = {
  userId: AAUser.uid,
  alg: Alg.ES256K,
  pubKey: '0x501D5c2Ce1EF208aadf9131a98BAa593258CfA06'
}

export const BBUser: User = {
  uid: 'bb@narval.xyz',
  role: UserRoles.ADMIN
}

export const BBUser_Credential_1: AuthCredential = {
  userId: BBUser.uid,
  alg: Alg.ES256K,
  pubKey: '0xab88c8785D0C00082dE75D801Fcb1d5066a6311e'
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
// @deprecated, use Credential store
export const userAddressStore: { [key: string]: string } = {
  '0xd75D626a116D4a1959fE3bB938B2e7c116A05890': MATT.uid,
  '0x501D5c2Ce1EF208aadf9131a98BAa593258CfA06': AAUser.uid,
  '0xab88c8785D0C00082dE75D801Fcb1d5066a6311e': BBUser.uid
}

export const userCredentialStore: { [key: string]: AuthCredential } = {
  '0xd75D626a116D4a1959fE3bB938B2e7c116A05890': MATT_CREDENTIAL_1,
  '0x501D5c2Ce1EF208aadf9131a98BAa593258CfA06': AAUser_Credential_1,
  '0xab88c8785D0C00082dE75D801Fcb1d5066a6311e': BBUser_Credential_1
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
  assignees: [MATT.uid]
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
  from: TREASURY_WALLET_X.uid as AccountId,
  to: ACCOUNT_Q_137.uid as AccountId,
  type: Intents.TRANSFER_NATIVE,
  amount: toHex(ONE_ETH),
  token: 'eip155:1/slip44:60' as AssetId // Caip19 for ETH
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
  data: '0x00000000',
  nonce: 192,
  type: '2'
}

export const REGO_REQUEST: RegoInput = {
  action: Action.SIGN_TRANSACTION,
  transactionRequest: NATIVE_TRANSFER_TX_REQUEST,
  intent: NATIVE_TRANSFER_INTENT,
  resource: {
    uid: TREASURY_WALLET_X.uid
  },
  principal: MATT_CREDENTIAL_1,
  approvals: [],
  transfers: []
}

export const mockEntityData: RegoData = {
  entities: {
    users: {
      [ROOT_USER.uid]: ROOT_USER,
      [MATT.uid]: MATT,
      [AAUser.uid]: AAUser,
      [BBUser.uid]: BBUser
    },
    userGroups: {
      [DEV_USER_GROUP.uid]: DEV_USER_GROUP,
      [TREASURY_USER_GROUP.uid]: TREASURY_USER_GROUP
    },
    wallets: {
      [SHY_ACCOUNT_WALLET.uid]: SHY_ACCOUNT_WALLET,
      [PIERRE_WALLET.uid]: PIERRE_WALLET,
      [WALLET_Q.uid]: WALLET_Q,
      [TREASURY_WALLET_X.uid]: TREASURY_WALLET_X
    },
    walletGroups: {
      [DEV_WALLET_GROUP.uid]: DEV_WALLET_GROUP,
      [TREASURY_WALLET_GROUP.uid]: TREASURY_WALLET_GROUP
    },
    addressBook: {
      [SHY_ACCOUNT_137.uid]: SHY_ACCOUNT_137,
      [SHY_ACCOUNT_1.uid]: SHY_ACCOUNT_1,
      [ACCOUNT_INTERNAL_WXZ_137.uid]: ACCOUNT_INTERNAL_WXZ_137,
      [ACCOUNT_Q_137.uid]: ACCOUNT_Q_137
    },
    tokens: {}
  }
}

// stub out the actual tx request & signature
// This is what would be the initial input from the external service
export const generateInboundRequest = async (): Promise<EvaluationRequest> => {
  const txRequest = NATIVE_TRANSFER_TX_REQUEST
  const request: Request = {
    action: Action.SIGN_TRANSACTION,
    nonce: 'random-nonce-111',
    transactionRequest: txRequest,
    resourceId: TREASURY_WALLET_X.uid
  }

  const signatureMatt = await privateKeyToAccount(UNSAFE_PRIVATE_KEY_MATT).signMessage({
    message: hashRequest(request)
  })
  // 0xe24d097cea880a40f8be2cf42f497b9fbda5f9e4a31b596827e051d78dce75c032fa7e5ee3046f7c6f116e5b98cb8d268fa9b9d222ff44719e2ec2a0d9159d0d1c
  const approvalSigAAUser = await privateKeyToAccount(UNSAFE_PRIVATE_KEY_AAUSER).signMessage({
    message: hashRequest(request)
  })
  // 0x48510e3b74799b8e8f4e01aba0d196e18f66d86a62ae91abf5b89be9391c15661c7d29ee4654a300ed6db977da512475ed5a39f70f677e23d1b2f53c1554d0dd1b
  const approvalSigBBUser = await privateKeyToAccount(UNSAFE_PRIVATE_KEY_BBUSER).signMessage({
    message: hashRequest(request)
  })
  // 0xcc645f43d8df80c4deeb2e60a8c0c15d58586d2c29ea7c85208cea81d1c47cbd787b1c8473dde70c3a7d49f573e491223107933257b2b99ecc4806b7cc16848d1c

  return {
    authentication: {
      sig: signatureMatt,
      alg: Alg.ES256K,
      pubKey: '0xd75D626a116D4a1959fE3bB938B2e7c116A05890'
    },
    request,
    approvals: [
      {
        sig: approvalSigAAUser,
        alg: Alg.ES256K,
        pubKey: '0x501D5c2Ce1EF208aadf9131a98BAa593258CfA06'
      },
      {
        sig: approvalSigBBUser,
        alg: Alg.ES256K,
        pubKey: '0xab88c8785D0C00082dE75D801Fcb1d5066a6311e'
      }
    ]
  }
}
/**
 * Sample API POST body for POST /evaluation that does the same thing as `generateInboundRequest
 {
  "authentication": {
    "sig": "0xe24d097cea880a40f8be2cf42f497b9fbda5f9e4a31b596827e051d78dce75c032fa7e5ee3046f7c6f116e5b98cb8d268fa9b9d222ff44719e2ec2a0d9159d0d1c",
    "alg": "ES256K",
    "pubKey": "0xd75D626a116D4a1959fE3bB938B2e7c116A05890"
  },
  "approvals": [
    {
      "sig": "0x48510e3b74799b8e8f4e01aba0d196e18f66d86a62ae91abf5b89be9391c15661c7d29ee4654a300ed6db977da512475ed5a39f70f677e23d1b2f53c1554d0dd1b",
      "alg": "ES256K",
      "pubKey": "0x501D5c2Ce1EF208aadf9131a98BAa593258CfA06"
    },
    {
      "sig": "0xcc645f43d8df80c4deeb2e60a8c0c15d58586d2c29ea7c85208cea81d1c47cbd787b1c8473dde70c3a7d49f573e491223107933257b2b99ecc4806b7cc16848d1c",
      "alg": "ES256K",
      "pubKey": "0xab88c8785D0C00082dE75D801Fcb1d5066a6311e"
    }
  ],
  "request": {
    "action": "signTransaction",
    "transactionRequest": {
      "from": "0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b",
      "to": "0x031d8C0cA142921c459bCB28104c0FF37928F9eD",
      "chainId": "137",
      "data": "0xa9059cbb000000000000000000000000031d8c0ca142921c459bcb28104c0ff37928f9ed000000000000000000000000000000000000000000005ab7f55035d1e7b4fe6d",
      "nonce": 192,
      "type": "2"
    },
    "resourceId": "eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b"
  }
}

 */
