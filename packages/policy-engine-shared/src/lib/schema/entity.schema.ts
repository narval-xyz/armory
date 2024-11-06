import { publicKeySchema } from '@narval/signature'
import { z } from 'zod'
import { ChainAccountId } from '../util/caip.util'
import { addressSchema } from './address.schema'

export const userRoleSchema = z.nativeEnum({
  ROOT: 'root',
  ADMIN: 'admin',
  MEMBER: 'member',
  MANAGER: 'manager'
} as const)

export const accountTypeSchema = z.nativeEnum({
  EOA: 'eoa',
  AA: '4337'
} as const)

export const accountClassificationSchema = z.nativeEnum({
  EXTERNAL: 'external',
  COUNTERPARTY: 'counterparty',
  INTERNAL: 'internal',
  MANAGED: 'managed'
} as const)

export const credentialEntitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  key: publicKeySchema
  // TODO @ptroger: Should we be allowing a private key to be passed in entity data ?
})

export const clientEntitySchema = z.object({
  id: z.string()
})

export const userEntitySchema = z.object({
  id: z.string(),
  role: userRoleSchema
})

export const userAccountEntitySchema = z.object({
  userId: z.string(),
  accountId: z.string()
})

export const userGroupMemberEntitySchema = z.object({
  userId: z.string(),
  groupId: z.string()
})

export const accountEntitySchema = z.object({
  id: z.string(),
  address: addressSchema,
  accountType: accountTypeSchema,
  chainId: z.number().optional()
})

export const accountGroupMemberEntitySchema = z.object({
  accountId: z.string(),
  groupId: z.string()
})

export const addressBookAccountEntitySchema = z.object({
  id: ChainAccountId,
  address: addressSchema,
  chainId: z.number(),
  classification: accountClassificationSchema
})

export const tokenEntitySchema = z.object({
  // TODO: (@wcalderipe, 13/06/24) For some reason the Open API generator maps
  // the `AssetId` schema to nothing.
  // I thought it was because it uses `z.custom`, but the Address is also a
  // custom schema. The main difference is that AssetId is a union of three
  // different custom schemas `z.union([NonCollectableAssetId,
  // CollectableAssetId, CoinAssetId])` and maybe that is causing the issue.
  id: z.string(),
  address: addressSchema,
  symbol: z.string().nullable(),
  chainId: z.number(),
  decimals: z.number()
})

export const accountGroupEntitySchema = z.object({
  id: z.string()
})

export const userGroupEntitySchema = z.object({
  id: z.string()
})

export const groupEntitySchema = z.object({
  id: z.string()
})

export const entitiesSchema = z.object({
  addressBook: z.array(addressBookAccountEntitySchema).default([]),
  credentials: z.array(credentialEntitySchema).default([]),
  tokens: z.array(tokenEntitySchema).default([]),
  userGroupMembers: z.array(userGroupMemberEntitySchema).default([]),
  userAccounts: z.array(userAccountEntitySchema).default([]),
  users: z.array(userEntitySchema).default([]),
  accountGroupMembers: z.array(accountGroupMemberEntitySchema).default([]),
  groups: z.array(groupEntitySchema).default([]).optional(),
  accountGroups: z.array(accountGroupEntitySchema).default([]).optional(),
  userGroups: z.array(userGroupEntitySchema).default([]).optional(),
  accounts: z.array(accountEntitySchema).default([])
})
