import { PrivateKeyAccount, sha256 } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { Alg } from './type/action.type'
import {
  AccountClassification,
  AccountType,
  AddressBookAccountEntity,
  CredentialEntity,
  Entities,
  OrganizationEntity,
  TokenEntity,
  UserEntity,
  UserGroupEntity,
  UserGroupMemberEntity,
  UserRole,
  UserWalletEntity,
  WalletEntity,
  WalletGroupEntity,
  WalletGroupMemberEntity
} from './type/entity.type'

const PERSONAS = ['Root', 'Alice', 'Bob', 'Carol', 'Dave'] as const
const GROUPS = ['Engineering', 'Treasury'] as const
const WALLETS = ['Engineering', 'Testing', 'Treasury', 'Operation'] as const

type Personas = (typeof PERSONAS)[number]
type Groups = (typeof GROUPS)[number]
type Wallets = (typeof WALLETS)[number]

export const ORGANIZATION: OrganizationEntity = {
  id: '7d704a62-d15e-4382-a826-1eb41563043b'
}

// See doc/prefixed-test-ethereum-accounts.md
export const UNSAFE_PRIVATE_KEY: Record<Personas, `0x${string}`> = {
  // 0x000966c8bf232032cd23f9002c4513dfea2531be
  Root: '0x4d377dba5424a7c1545a3c7b0522592927d49d2600a66f12e07a3977bafd79ab',
  // 0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43
  Alice: '0x454c9f13f6591f6482b17bdb6a671a7294500c7dd126111ce1643b03b6aeb354',
  // 0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23
  Bob: '0x569a6614716a76fdb9cf21b842d012add85e680b51fd4fb773109a93c6c4f307',
  // 0xccc1472fce4ec74a1e3f9653776acfc790cd0743
  Carol: '0x33be709d0e3ffcd9ffa3d983d3fe3a55c34ab4eb4db2577847667262094f1786',
  // 0xddd26a02e7c54e8dc373b9d2dcb309ecdeca815d
  Dave: '0x82a0cf4f0fdfd42d93ff328b73bfdbc9c8b4f95f5aedfae82059753fc08a180f'
}

export const ACCOUNT: Record<Personas, PrivateKeyAccount> = {
  Root: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Root),
  Alice: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Alice),
  Bob: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Bob),
  Carol: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Carol),
  Dave: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Dave)
}

export const USER: Record<Personas, UserEntity> = {
  Root: {
    id: 'test-root-user-uid',
    role: UserRole.ROOT
  },
  Alice: {
    id: 'test-alice-user-uid',
    role: UserRole.ADMIN
  },
  Bob: {
    id: 'test-bob-user-uid',
    role: UserRole.ADMIN
  },
  Carol: {
    id: 'test-carol-user-uid',
    role: UserRole.MANAGER
  },
  Dave: {
    id: 'test-dave-user-uid',
    role: UserRole.MEMBER
  }
}

export const CREDENTIAL: Record<Personas, CredentialEntity> = {
  Root: {
    id: sha256(ACCOUNT.Root.address).toLowerCase(),
    pubKey: ACCOUNT.Root.address,
    alg: Alg.ES256K,
    userId: USER.Root.id
  },
  Alice: {
    id: sha256(ACCOUNT.Alice.address).toLowerCase(),
    pubKey: ACCOUNT.Alice.address,
    alg: Alg.ES256K,
    userId: USER.Alice.id
  },
  Bob: {
    id: sha256(ACCOUNT.Bob.address).toLowerCase(),
    pubKey: ACCOUNT.Bob.address,
    alg: Alg.ES256K,
    userId: USER.Bob.id
  },
  Carol: {
    id: sha256(ACCOUNT.Carol.address).toLowerCase(),
    pubKey: ACCOUNT.Carol.address,
    alg: Alg.ES256K,
    userId: USER.Carol.id
  },
  Dave: {
    id: sha256(ACCOUNT.Dave.address).toLowerCase(),
    pubKey: ACCOUNT.Dave.address,
    alg: Alg.ES256K,
    userId: USER.Dave.id
  }
}

export const USER_GROUP: Record<Groups, UserGroupEntity> = {
  Engineering: {
    id: 'test-engineering-user-group-uid'
  },
  Treasury: {
    id: 'test-treasury-user-group-uid'
  }
}

export const USER_GROUP_MEMBER: UserGroupMemberEntity[] = [
  {
    groupId: USER_GROUP.Engineering.id,
    userId: USER.Alice.id
  },
  {
    groupId: USER_GROUP.Engineering.id,
    userId: USER.Carol.id
  },
  {
    groupId: USER_GROUP.Treasury.id,
    userId: USER.Bob.id
  }
]

export const WALLET: Record<Wallets, WalletEntity> = {
  Testing: {
    id: 'eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e',
    address: '0xddcf208f219a6e6af072f2cfdc615b2c1805f98e',
    accountType: AccountType.EOA
  },
  Engineering: {
    id: 'eip155:eoa:0x22228d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
    address: '0x22228d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
    accountType: AccountType.EOA
  },
  Treasury: {
    id: 'eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b', // Prod guild 58 - treasury wallet
    address: '0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
    accountType: AccountType.EOA
  },
  Operation: {
    id: 'eip155:eoa:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
    address: '0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
    accountType: AccountType.EOA
  }
}

export const WALLET_GROUP: Record<Groups, WalletGroupEntity> = {
  Engineering: {
    id: 'test-engineering-wallet-group-uid'
  },
  Treasury: {
    id: 'test-treasury-wallet-group-uid'
  }
}

export const WALLET_GROUP_MEMBER: WalletGroupMemberEntity[] = [
  {
    groupId: WALLET_GROUP.Engineering.id,
    walletId: WALLET.Engineering.id
  },
  {
    groupId: WALLET_GROUP.Engineering.id,
    walletId: WALLET.Testing.id
  },
  {
    groupId: WALLET_GROUP.Treasury.id,
    walletId: WALLET.Treasury.id
  },
  {
    groupId: WALLET_GROUP.Treasury.id,
    walletId: WALLET.Operation.id
  }
]

export const USER_WALLET: UserWalletEntity[] = [
  {
    walletId: WALLET.Operation.id,
    userId: USER.Alice.id
  },
  {
    walletId: WALLET.Testing.id,
    userId: USER.Alice.id
  },
  {
    walletId: WALLET.Treasury.id,
    userId: USER.Alice.id
  }
]

export const ADDRESS_BOOK: AddressBookAccountEntity[] = [
  {
    id: `eip155:137:${WALLET.Testing.address}`,
    address: WALLET.Testing.address,
    chainId: 137,
    classification: AccountClassification.WALLET
  },
  {
    id: `eip155:1:${WALLET.Engineering.address}`,
    address: WALLET.Engineering.address,
    chainId: 1,
    classification: AccountClassification.WALLET
  },
  {
    id: `eip155:137:${WALLET.Engineering.address}`,
    address: WALLET.Treasury.address,
    chainId: 137,
    classification: AccountClassification.WALLET
  },
  {
    id: `eip155:137:${WALLET.Engineering.address}`,
    address: WALLET.Engineering.address,
    chainId: 137,
    classification: AccountClassification.WALLET
  },
  {
    id: `eip155:1:${WALLET.Treasury.address}`,
    address: WALLET.Treasury.address,
    chainId: 1,
    classification: AccountClassification.WALLET
  },
  {
    id: `eip155:137:${WALLET.Operation.address}`,
    address: WALLET.Operation.address,
    chainId: 137,
    classification: AccountClassification.WALLET
  }
]

export const TOKEN: Record<`${string}1` | `${string}137`, TokenEntity> = {
  usdc1: {
    id: 'eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    chainId: 1,
    symbol: 'USDC',
    decimals: 6
  },
  usdc137: {
    id: 'eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    chainId: 137,
    symbol: 'USDC',
    decimals: 6
  }
}

export const ENTITIES: Entities = {
  addressBook: ADDRESS_BOOK,
  credentials: Object.values(CREDENTIAL),
  tokens: Object.values(TOKEN),
  userGroupMembers: USER_GROUP_MEMBER,
  userGroups: Object.values(USER_GROUP),
  userWallets: USER_WALLET,
  users: Object.values(USER),
  walletGroupMembers: WALLET_GROUP_MEMBER,
  walletGroups: Object.values(WALLET_GROUP),
  wallets: Object.values(WALLET)
}
