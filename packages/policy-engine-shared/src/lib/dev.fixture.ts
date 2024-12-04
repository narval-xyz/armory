import {
  Alg,
  Curves,
  Hex,
  KeyTypes,
  Secp256k1PublicKey,
  SigningAlg,
  privateKeyToJwk,
  secp256k1PublicKeySchema
} from '@narval/signature'
import { PrivateKeyAccount } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { Action } from './type/action.type'
import { EntityType, ValueOperators } from './type/domain.type'
import {
  AccountClassification,
  AccountEntity,
  AccountGroupEntity,
  AccountGroupMemberEntity,
  AccountType,
  AddressBookAccountEntity,
  ClientEntity,
  CredentialEntity,
  Entities,
  GroupEntity,
  GroupMemberEntity,
  TokenEntity,
  UserAccountEntity,
  UserEntity,
  UserGroupEntity,
  UserGroupMemberEntity,
  UserRole
} from './type/entity.type'
import { Criterion, Policy, Then } from './type/policy.type'

const PERSONAS = ['Root', 'Alice', 'Bob', 'Carol', 'Dave', 'Eric', 'SystemManager'] as const
const GROUPS_NAME = ['Engineering', 'Treasury'] as const
const ACCOUNTS_NAME = ['Engineering', 'Testing', 'Treasury', 'Operation'] as const

type Personas = (typeof PERSONAS)[number]
type Groups = (typeof GROUPS_NAME)[number]
type Accounts = (typeof ACCOUNTS_NAME)[number]

export const CLIENT: ClientEntity = {
  id: '7d704a62-d15e-4382-a826-1eb41563043b'
}

export const AddressBookAddresses = {
  External: '0x1118ee1cbaa1856f4550c6fc24abb16c5c9b2a43' as Hex,
  Internal: '0x2227be636c3ad8cf9d08ba8bdba4abd2ef29bd23' as Hex,
  CounterParty: '0x3331472fce4ec74a1e3f9653776acfc790cd0743' as Hex
}

export const UNSAFE_PRIVATE_KEY: Record<Personas, `0x${string}`> = {
  // 0x000c0d191308a336356bee3813cc17f6868972c4
  Root: '0xa95b097938cc1d1a800d2b10d2a175f979613c940868460fd66830059fc1e418',
  // 0xaaa8ee1cbaa1856f4550c6fc24abb16c5c9b2a43
  Alice: '0x454c9f13f6591f6482b17bdb6a671a7294500c7dd126111ce1643b03b6aeb354',
  // 0xbbb7be636c3ad8cf9d08ba8bdba4abd2ef29bd23
  Bob: '0x569a6614716a76fdb9cf21b842d012add85e680b51fd4fb773109a93c6c4f307',
  // 0xccc1472fce4ec74a1e3f9653776acfc790cd0743
  Carol: '0x33be709d0e3ffcd9ffa3d983d3fe3a55c34ab4eb4db2577847667262094f1786',
  // 0xddd26a02e7c54e8dc373b9d2dcb309ecdeca815d
  Dave: '0x82a0cf4f0fdfd42d93ff328b73bfdbc9c8b4f95f5aedfae82059753fc08a180f',
  // 0xeee3b0b3b4b7b8b9babbbcbdbebfc0c1c2c3c4c5
  Eric: '0x3e4989d1d83959d9dbec1f14bfb0685cfd15f4fd5037dc6e37e88e01838aef65',
  // 0x0xfffFA973C351Df1BE703dA81b0C6BE08Abc51500
  SystemManager: '0xa05bf30ec3423e414b16ba737cab1f17b2bf938133007ceb5b4cf55a20eea36a'
}

export const PUBLIC_KEYS_JWK: Record<Personas, Secp256k1PublicKey> = {
  Root: secp256k1PublicKeySchema.parse(privateKeyToJwk(UNSAFE_PRIVATE_KEY.Root, Alg.ES256K)),
  Alice: secp256k1PublicKeySchema.parse(privateKeyToJwk(UNSAFE_PRIVATE_KEY.Alice, Alg.ES256K)),
  Bob: secp256k1PublicKeySchema.parse(privateKeyToJwk(UNSAFE_PRIVATE_KEY.Bob, Alg.ES256K)),
  Carol: secp256k1PublicKeySchema.parse(privateKeyToJwk(UNSAFE_PRIVATE_KEY.Carol, Alg.ES256K)),
  Dave: secp256k1PublicKeySchema.parse(privateKeyToJwk(UNSAFE_PRIVATE_KEY.Dave, Alg.ES256K)),
  Eric: secp256k1PublicKeySchema.parse(privateKeyToJwk(UNSAFE_PRIVATE_KEY.Eric, Alg.ES256K)),
  SystemManager: secp256k1PublicKeySchema.parse(privateKeyToJwk(UNSAFE_PRIVATE_KEY.SystemManager, Alg.ES256K))
}

export const VIEM_ACCOUNT: Record<Personas, PrivateKeyAccount> = {
  Root: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Root),
  Alice: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Alice),
  Bob: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Bob),
  Carol: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Carol),
  Dave: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Dave),
  Eric: privateKeyToAccount(UNSAFE_PRIVATE_KEY.Eric),
  SystemManager: privateKeyToAccount(UNSAFE_PRIVATE_KEY.SystemManager)
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
  },
  Eric: {
    id: 'test-eric-user-uid',
    role: UserRole.MEMBER
  },
  SystemManager: {
    id: 'test-system-manager-user-uid',
    role: UserRole.MANAGER
  }
}

export const CREDENTIAL: Record<Personas, CredentialEntity> = {
  Root: {
    id: PUBLIC_KEYS_JWK.Root.kid,
    userId: USER.Root.id,
    key: PUBLIC_KEYS_JWK.Root
  },
  Alice: {
    userId: USER.Alice.id,
    id: PUBLIC_KEYS_JWK.Alice.kid,
    key: PUBLIC_KEYS_JWK.Alice
  },
  Bob: {
    userId: USER.Bob.id,
    id: PUBLIC_KEYS_JWK.Bob.kid,
    key: PUBLIC_KEYS_JWK.Bob
  },
  Carol: {
    userId: USER.Carol.id,
    id: PUBLIC_KEYS_JWK.Carol.kid,
    key: PUBLIC_KEYS_JWK.Carol
  },
  Dave: {
    userId: USER.Dave.id,
    id: PUBLIC_KEYS_JWK.Dave.kid,
    key: PUBLIC_KEYS_JWK.Dave
  },
  Eric: {
    userId: USER.Eric.id,
    id: PUBLIC_KEYS_JWK.Eric.kid,
    key: PUBLIC_KEYS_JWK.Eric
  },
  SystemManager: {
    userId: USER.SystemManager.id,
    id: PUBLIC_KEYS_JWK.SystemManager.kid,
    key: PUBLIC_KEYS_JWK.SystemManager
  }
}

export const EOA_CREDENTIAL: Record<Personas, CredentialEntity> = {
  Root: {
    id: VIEM_ACCOUNT.Root.address,
    userId: USER.Root.id,
    key: {
      kty: KeyTypes.EC,
      crv: Curves.SECP256K1,
      alg: SigningAlg.ES256K,
      kid: VIEM_ACCOUNT.Root.address,
      addr: VIEM_ACCOUNT.Root.address
    }
  },
  Alice: {
    id: VIEM_ACCOUNT.Alice.address,
    userId: USER.Alice.id,
    key: {
      kty: KeyTypes.EC,
      crv: Curves.SECP256K1,
      alg: SigningAlg.ES256K,
      kid: VIEM_ACCOUNT.Alice.address,
      addr: VIEM_ACCOUNT.Alice.address
    }
  },
  Bob: {
    id: VIEM_ACCOUNT.Bob.address,
    userId: USER.Bob.id,
    key: {
      kty: KeyTypes.EC,
      crv: Curves.SECP256K1,
      alg: SigningAlg.ES256K,
      kid: VIEM_ACCOUNT.Bob.address,
      addr: VIEM_ACCOUNT.Bob.address
    }
  },
  Carol: {
    id: VIEM_ACCOUNT.Carol.address,
    userId: USER.Carol.id,
    key: {
      kty: KeyTypes.EC,
      crv: Curves.SECP256K1,
      alg: SigningAlg.ES256K,
      kid: VIEM_ACCOUNT.Carol.address,
      addr: VIEM_ACCOUNT.Carol.address
    }
  },
  Dave: {
    id: VIEM_ACCOUNT.Dave.address,
    userId: USER.Dave.id,
    key: {
      kty: KeyTypes.EC,
      crv: Curves.SECP256K1,
      alg: SigningAlg.ES256K,
      kid: VIEM_ACCOUNT.Dave.address,
      addr: VIEM_ACCOUNT.Dave.address
    }
  },
  Eric: {
    id: VIEM_ACCOUNT.Eric.address,
    userId: USER.Eric.id,
    key: {
      kty: KeyTypes.EC,
      crv: Curves.SECP256K1,
      alg: SigningAlg.ES256K,
      kid: VIEM_ACCOUNT.Eric.address,
      addr: VIEM_ACCOUNT.Eric.address
    }
  },
  SystemManager: {
    id: VIEM_ACCOUNT.SystemManager.address,
    userId: USER.SystemManager.id,
    key: {
      kty: KeyTypes.EC,
      crv: Curves.SECP256K1,
      alg: SigningAlg.ES256K,
      kid: VIEM_ACCOUNT.SystemManager.address,
      addr: VIEM_ACCOUNT.SystemManager.address
    }
  }
}

export const GROUP: Record<Groups, GroupEntity> = {
  Engineering: {
    id: 'test-engineering-group-uid'
  },
  Treasury: {
    id: 'test-treasury-group-uid'
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

export const UNSAFE_ACCOUNT_PRIVATE_KEY: Record<Accounts, Hex> = {
  Engineering: '0x1c2813a646825e89229434ad424c973e0fd043e4e99976abf6c7938419ca70b2',
  Testing: '0x84daac66f32f715deded36d3cd22cd35a2f2b286d1205886899fff827dc1f3f2',
  Treasury: '0x136f85910606e14fc69ffad7f1d77efc0f08284d1d9ac3369e51aeef81c8316e',
  Operation: '0x2743f953c8912cbfec84702744b43937cfcb71b3d1fba7a1e6c08a2d6d726991'
}

export const ACCOUNTSNAME_VIEMACCOUNT: Record<Accounts, PrivateKeyAccount> = {
  Engineering: privateKeyToAccount(UNSAFE_ACCOUNT_PRIVATE_KEY.Engineering),
  Testing: privateKeyToAccount(UNSAFE_ACCOUNT_PRIVATE_KEY.Testing),
  Treasury: privateKeyToAccount(UNSAFE_ACCOUNT_PRIVATE_KEY.Treasury),
  Operation: privateKeyToAccount(UNSAFE_ACCOUNT_PRIVATE_KEY.Operation)
}

export const ACCOUNT: Record<Accounts, AccountEntity> = {
  Testing: {
    id: `eip155:eoa:${ACCOUNTSNAME_VIEMACCOUNT.Testing.address}`,
    address: ACCOUNTSNAME_VIEMACCOUNT.Testing.address,
    accountType: AccountType.EOA
  },
  Engineering: {
    id: `eip155:eoa:${ACCOUNTSNAME_VIEMACCOUNT.Engineering.address}`,
    address: ACCOUNTSNAME_VIEMACCOUNT.Engineering.address,
    accountType: AccountType.EOA
  },
  Treasury: {
    id: `eip155:eoa:${ACCOUNTSNAME_VIEMACCOUNT.Treasury.address}`,
    address: ACCOUNTSNAME_VIEMACCOUNT.Treasury.address,
    accountType: AccountType.EOA
  },
  Operation: {
    id: `eip155:eoa:${ACCOUNTSNAME_VIEMACCOUNT.Operation.address}`,
    address: ACCOUNTSNAME_VIEMACCOUNT.Operation.address,
    accountType: AccountType.EOA
  }
}

export const GROUP_MEMBER: GroupMemberEntity[] = [
  {
    groupId: GROUP.Engineering.id,
    userId: USER.Alice.id,
    type: 'user'
  },
  {
    groupId: GROUP.Engineering.id,
    userId: USER.Carol.id,
    type: 'user'
  },
  {
    groupId: GROUP.Treasury.id,
    userId: USER.Bob.id,
    type: 'user'
  },
  {
    groupId: GROUP.Treasury.id,
    userId: USER.Eric.id,
    type: 'user'
  },
  {
    groupId: GROUP.Treasury.id,
    userId: USER.Dave.id,
    type: 'user'
  },
  {
    groupId: GROUP.Engineering.id,
    accountId: ACCOUNT.Engineering.id,
    type: 'account'
  },
  {
    groupId: GROUP.Engineering.id,
    accountId: ACCOUNT.Testing.id,
    type: 'account'
  },
  {
    groupId: GROUP.Treasury.id,
    accountId: ACCOUNT.Treasury.id,
    type: 'account'
  },
  {
    groupId: GROUP.Treasury.id,
    accountId: ACCOUNT.Operation.id,
    type: 'account'
  }
]

export const USER_GROUP_MEMBER: UserGroupMemberEntity[] = [
  {
    groupId: GROUP.Engineering.id,
    userId: USER.Alice.id
  },
  {
    groupId: GROUP.Engineering.id,
    userId: USER.Carol.id
  },
  {
    groupId: GROUP.Treasury.id,
    userId: USER.Bob.id
  },
  {
    groupId: GROUP.Treasury.id,
    userId: USER.Eric.id
  },
  {
    groupId: GROUP.Treasury.id,
    userId: USER.Dave.id
  }
]

/*
{
  Testing: {
    id: 'eip155:eoa:0x0f610AC9F0091f8F573c33f15155afE8aD747495',
    address: '0x0f610AC9F0091f8F573c33f15155afE8aD747495',
    accountType: 'eoa'
  },
  Engineering: {
    id: 'eip155:eoa:0x9f38879167acCf7401351027EE3f9247A71cd0c5',
    address: '0x9f38879167acCf7401351027EE3f9247A71cd0c5',
    accountType: 'eoa'
  },
  Treasury: {
    id: 'eip155:eoa:0x0301e2724a40E934Cce3345928b88956901aA127',
    address: '0x0301e2724a40E934Cce3345928b88956901aA127',
    accountType: 'eoa'
  },
  Operation: {
    id: 'eip155:eoa:0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
    address: '0x76d1b7f9b3F69C435eeF76a98A415332084A856F',
    accountType: 'eoa'
  }
}
*/

export const ACCOUNT_GROUP_MEMBER: AccountGroupMemberEntity[] = [
  {
    groupId: GROUP.Engineering.id,
    accountId: ACCOUNT.Engineering.id
  },
  {
    groupId: GROUP.Engineering.id,
    accountId: ACCOUNT.Testing.id
  },
  {
    groupId: GROUP.Treasury.id,
    accountId: ACCOUNT.Treasury.id
  },
  {
    groupId: GROUP.Treasury.id,
    accountId: ACCOUNT.Operation.id
  }
]

export const USER_ACCOUNT: UserAccountEntity[] = [
  {
    accountId: ACCOUNT.Operation.id,
    userId: USER.Alice.id
  },
  {
    accountId: ACCOUNT.Testing.id,
    userId: USER.Alice.id
  },
  {
    accountId: ACCOUNT.Treasury.id,
    userId: USER.Alice.id
  }
]

export const ACCOUNT_GROUP: Record<Groups, AccountGroupEntity> = {
  Engineering: {
    id: 'test-engineering-account-group-uid'
  },
  Treasury: {
    id: 'test-treasury-account-group-uid'
  }
}

export const ADDRESS_BOOK: AddressBookAccountEntity[] = [
  {
    id: `eip155:137:${ACCOUNT.Testing.address}`,
    address: ACCOUNT.Testing.address,
    chainId: 137,
    classification: AccountClassification.MANAGED
  },
  {
    id: `eip155:1:${ACCOUNT.Engineering.address}`,
    address: ACCOUNT.Engineering.address,
    chainId: 1,
    classification: AccountClassification.MANAGED
  },
  {
    id: `eip155:137:${ACCOUNT.Engineering.address}`,
    address: ACCOUNT.Treasury.address,
    chainId: 137,
    classification: AccountClassification.MANAGED
  },
  {
    id: `eip155:1:${ACCOUNT.Treasury.address}`,
    address: ACCOUNT.Treasury.address,
    chainId: 1,
    classification: AccountClassification.MANAGED
  },
  {
    id: `eip155:137:${ACCOUNT.Operation.address}`,
    address: ACCOUNT.Operation.address,
    chainId: 137,
    classification: AccountClassification.MANAGED
  },
  {
    id: `eip155:1:${AddressBookAddresses.External}`,
    address: AddressBookAddresses.External,
    chainId: 1,
    classification: AccountClassification.EXTERNAL
  },
  {
    id: `eip155:137:${AddressBookAddresses.Internal}`,
    address: AddressBookAddresses.Internal,
    chainId: 137,
    classification: AccountClassification.INTERNAL
  },
  {
    id: `eip155:1:${AddressBookAddresses.CounterParty}`,
    address: AddressBookAddresses.CounterParty,
    chainId: 1,
    classification: AccountClassification.COUNTERPARTY
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
  credentials: [...Object.values(CREDENTIAL), ...Object.values(EOA_CREDENTIAL)],
  tokens: Object.values(TOKEN),
  // userGroupMembers: USER_GROUP_MEMBER,
  // userGroups: Object.values(USER_GROUP),
  // accountGroups: Object.values(ACCOUNT_GROUP),
  // accountGroupMembers: ACCOUNT_GROUP_MEMBER,
  groupMembers: Object.values(GROUP_MEMBER),
  groups: Object.values(GROUP),
  userAccounts: USER_ACCOUNT,
  users: Object.values(USER),
  accounts: Object.values(ACCOUNT)
}

export const POLICIES: Policy[] = [
  {
    id: 'c13fe2c1-ecbe-43fe-9e0e-fae730fd5f50',
    description: 'Required approval for an admin to transfer ERC-721 or ERC-1155 tokens',
    when: [
      {
        criterion: Criterion.CHECK_PRINCIPAL_ROLE,
        args: [UserRole.ADMIN]
      },
      {
        criterion: Criterion.CHECK_ACTION,
        args: [Action.SIGN_TRANSACTION]
      },
      {
        criterion: Criterion.CHECK_INTENT_TYPE,
        args: ['transferErc721', 'transferErc1155']
      },
      {
        criterion: Criterion.CHECK_APPROVALS,
        args: [
          {
            approvalCount: 2,
            countPrincipal: false,
            approvalEntityType: EntityType.User,
            entityIds: [USER.Bob.id, USER.Carol.id]
          }
        ]
      }
    ],
    then: Then.PERMIT
  },
  {
    id: 'f8ff8a65-a3ac-410f-800b-e345c49f9db9',
    description: 'Authorize native transfers of up to 1 MATIC every 24 hours',
    when: [
      {
        criterion: Criterion.CHECK_ACTION,
        args: [Action.SIGN_TRANSACTION]
      },
      {
        criterion: Criterion.CHECK_INTENT_TYPE,
        args: ['transferNative']
      },
      {
        criterion: Criterion.CHECK_INTENT_TOKEN,
        args: ['eip155:137/slip44:966']
      },
      {
        criterion: Criterion.CHECK_SPENDING_LIMIT,
        args: {
          limit: '1000000000000000000',
          operator: ValueOperators.LESS_THAN_OR_EQUAL,
          timeWindow: {
            type: 'rolling',
            value: 43_200
          }
        }
      }
    ],
    then: Then.PERMIT
  }
]
