import { Alg } from '@narval/signature'
import { z } from 'zod'
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
  WALLET: 'wallet'
} as const)

export const credentialEntitySchema = z.object({
  id: z.string(),
  pubKey: z.string(),
  address: z.string().optional(),
  alg: z.nativeEnum(Alg),
  userId: z.string()
})

export const organizationEntitySchema = z.object({
  id: z.string()
})

export const userEntitySchema = z.object({
  id: z.string(),
  role: userRoleSchema
})

export const userGroupEntitySchema = z.object({
  id: z.string()
})

export const userWalletEntitySchema = z.object({
  userId: z.string(),
  walletId: z.string()
})

export const userGroupMemberEntitySchema = z.object({
  userId: z.string(),
  groupId: z.string()
})

export const walletEntitySchema = z.object({
  id: z.string(),
  address: addressSchema,
  accountType: accountTypeSchema,
  chainId: z.number().optional()
})

export const walletGroupEntitySchema = z.object({
  id: z.string()
})

export const walletGroupMemberEntitySchema = z.object({
  walletId: z.string(),
  groupId: z.string()
})

export const addressBookAccountEntitySchema = z.object({
  id: z.string(),
  address: addressSchema,
  chainId: z.number(),
  classification: accountClassificationSchema
})

export const tokenEntitySchema = z.object({
  id: z.string(),
  address: addressSchema,
  symbol: z.string(),
  chainId: z.number(),
  decimals: z.number()
})

export const entitiesSchema = z.object({
  addressBook: z.array(addressBookAccountEntitySchema),
  credentials: z.array(credentialEntitySchema),
  tokens: z.array(tokenEntitySchema),
  userGroupMembers: z.array(userGroupMemberEntitySchema),
  userGroups: z.array(userGroupEntitySchema),
  userWallets: z.array(userWalletEntitySchema),
  users: z.array(userEntitySchema),
  walletGroupMembers: z.array(walletGroupMemberEntitySchema),
  walletGroups: z.array(walletGroupEntitySchema),
  wallets: z.array(walletEntitySchema)
})
