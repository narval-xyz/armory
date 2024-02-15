import { PrivateKeyAccount, sha256 } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { AccountClassification, AccountType, Alg, AuthCredential, UserRole } from './type/action.type'
import {
  AddressBookAccountEntity,
  Entities,
  OrganizationEntity,
  TokenEntity,
  UserEntity,
  UserGroupEntity,
  WalletEntity,
  WalletGroupEntity
} from './type/entity.type'

const PERSONA = ['Root', 'Alice', 'Bob', 'Carol', 'Dave'] as const

type Persona = (typeof PERSONA)[number]

export const ORGANIZATION: OrganizationEntity = {
  uid: '7d704a62-d15e-4382-a826-1eb41563043b'
}

export const UNSAFE_PRIVATE_KEY: Record<Persona, `0x${string}`> = {
  // 0x000966c8bf232032cd23f9002c4513dfea2531be
  Root: '0x4d377dba5424a7c1545a3c7b0522592927d49d2600a66f12e07a3977bafd79ab',
  Alice: '0x454c9f13f6591f6482b17bdb6a671a7294500c7dd126111ce1643b03b6aeb354',
  Bob: '0x569a6614716a76fdb9cf21b842d012add85e680b51fd4fb773109a93c6c4f307',
  Carol: '0x33be709d0e3ffcd9ffa3d983d3fe3a55c34ab4eb4db2577847667262094f1786',
  Dave: '0x82a0cf4f0fdfd42d93ff328b73bfdbc9c8b4f95f5aedfae82059753fc08a180f'
}

export const ACCOUNT: Record<Persona, PrivateKeyAccount> = {
  Root: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Root),
  Alice: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Alice),
  Bob: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Bob),
  Carol: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Carol),
  Dave: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Dave)
}

export const USER: Record<Persona, UserEntity> = {
  Root: {
    uid: 'root:608bi1ef7-0efc-4a40-8739-0178a993b77c',
    role: UserRole.ROOT
  },
  Alice: {
    uid: 'alice:0c6111fb-96ef-4177-8510-8cd994cc17ba',
    role: UserRole.ADMIN
  },
  Bob: {
    uid: 'bob:3761b384-b5d3-4d29-9ed8-4b615fa1bcb3',
    role: UserRole.ADMIN
  },
  Carol: {
    uid: 'carol:422dfe0b-0de1-44de-aaee-5262d6ebfb64',
    role: UserRole.MANAGER
  },
  Dave: {
    uid: 'dave:4e7f31ad-a8e9-4a07-a19b-91c6883d7adb',
    role: UserRole.MEMBER
  }
}

export const CREDENTIAL: Record<Persona, AuthCredential> = {
  Root: {
    uid: sha256(ACCOUNT.Root.address).toLowerCase(),
    pubKey: ACCOUNT.Root.address,
    alg: Alg.ES256K,
    userId: USER.Root.uid
  },
  Alice: {
    uid: sha256(ACCOUNT.Alice.address).toLowerCase(),
    pubKey: ACCOUNT.Alice.address,
    alg: Alg.ES256K,
    userId: USER.Alice.uid
  },
  Bob: {
    uid: sha256(ACCOUNT.Bob.address).toLowerCase(),
    pubKey: ACCOUNT.Bob.address,
    alg: Alg.ES256K,
    userId: USER.Bob.uid
  },
  Carol: {
    uid: sha256(ACCOUNT.Carol.address).toLowerCase(),
    pubKey: ACCOUNT.Carol.address,
    alg: Alg.ES256K,
    userId: USER.Carol.uid
  },
  Dave: {
    uid: sha256(ACCOUNT.Dave.address).toLowerCase(),
    pubKey: ACCOUNT.Dave.address,
    alg: Alg.ES256K,
    userId: USER.Dave.uid
  }
}

export const USER_GROUP: Record<string, UserGroupEntity> = {
  engineering: {
    uid: 'ug:4735e190-6985-4f58-a723-c1a3aeec8b8c',
    users: [USER.Alice.uid, USER.Carol.uid]
  },
  treasury: {
    uid: 'ug:08319ee9-c4f1-458f-b88c-e501ac575957',
    users: [USER.Bob.uid, USER.Dave.uid]
  }
}

export const WALLET: Record<string, WalletEntity> = {
  engineering1: {
    uid: 'eip155:eoa:0xddcf208f219a6e6af072f2cfdc615b2c1805f98e',
    address: '0xddcf208f219a6e6af072f2cfdc615b2c1805f98e',
    accountType: AccountType.EOA,
    assignees: [USER.Alice.uid]
  },
  engineering2: {
    uid: 'eip155:eoa:0x22228d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
    address: '0x22228d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
    accountType: AccountType.EOA
  },
  treasury: {
    uid: 'eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b', // Prod guild 58 - treasury wallet
    address: '0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
    accountType: AccountType.EOA,
    assignees: [USER.Alice.uid]
  },
  operations: {
    uid: 'eip155:eoa:0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
    address: '0x08a08d0504d4f3363a5b7fda1f5fff1c7bca8ad4',
    accountType: AccountType.EOA,
    assignees: [USER.Alice.uid]
  }
}

export const WALLET_GROUP: Record<string, WalletGroupEntity> = {
  engineering: {
    uid: 'wg:9e60a686-ffbb-44fb-8bae-742fe1dedefb',
    wallets: [WALLET.engineering1.uid, WALLET.engineering2.uid]
  },
  treasury: {
    uid: 'wg:df5db763-a3e0-4e19-848c-214e527e47cc',
    wallets: [WALLET.treasury.uid]
  }
}

export const ADDRESS_BOOK: AddressBookAccountEntity[] = [
  {
    uid: `eip155:137:${WALLET.engineering1.address}`,
    address: WALLET.engineering1.address,
    chainId: 137,
    classification: AccountClassification.WALLET
  },
  {
    uid: `eip155:1:${WALLET.engineering1.address}`,
    address: WALLET.engineering1.address,
    chainId: 1,
    classification: AccountClassification.WALLET
  },
  {
    uid: `eip155:137:${WALLET.engineering2.address}`,
    address: WALLET.engineering2.address,
    chainId: 137,
    classification: AccountClassification.WALLET
  },
  {
    uid: `eip155:137:${WALLET.treasury.address}`,
    address: WALLET.treasury.address,
    chainId: 137,
    classification: AccountClassification.WALLET
  },
  {
    uid: `eip155:1:${WALLET.treasury.address}`,
    address: WALLET.treasury.address,
    chainId: 1,
    classification: AccountClassification.WALLET
  },
  {
    uid: `eip155:137:${WALLET.operations.address}`,
    address: WALLET.operations.address,
    chainId: 137,
    classification: AccountClassification.WALLET
  }
]

export const TOKEN: Record<string, TokenEntity> = {
  usdc1: {
    uid: 'eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    chainId: 1,
    symbol: 'USDC',
    decimals: 6
  },
  usdc137: {
    uid: 'eip155:137/erc20:0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
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
  userGroups: Object.values(USER_GROUP),
  users: Object.values(USER),
  walletGroups: Object.values(WALLET_GROUP),
  wallets: Object.values(WALLET)
}
