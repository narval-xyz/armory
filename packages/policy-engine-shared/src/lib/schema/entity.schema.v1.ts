import { publicKeySchema } from '@narval/signature'
import { z } from 'zod'
import { ChainAccountId } from '../util/caip.util'
import { addressSchema } from './address.schema'
import { credentialEntitySchema } from './credential.schema'

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

export const clientEntitySchema = z.object({
  id: z.string()
})

export const userEntitySchema = z.object({
  id: z.string(),
  role: userRoleSchema
})

export const userGroupEntitySchema = z.object({
  id: z.string()
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

export const accountGroupEntitySchema = z.object({
  id: z.string()
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

export const entitiesV1Schema = z.object({
  version: z.literal('1').optional(),
  addressBook: z.array(addressBookAccountEntitySchema),
  credentials: z.array(credentialEntitySchema),
  tokens: z.array(tokenEntitySchema),
  userGroupMembers: z.array(userGroupMemberEntitySchema),
  userGroups: z.array(userGroupEntitySchema),
  userAccounts: z.array(userAccountEntitySchema),
  users: z.array(userEntitySchema),
  accountGroupMembers: z.array(accountGroupMemberEntitySchema),
  accountGroups: z.array(accountGroupEntitySchema),
  accounts: z.array(accountEntitySchema)
})
