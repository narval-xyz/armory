import { z } from 'zod'
import {
  accountClassificationSchema,
  accountTypeSchema,
  addressBookAccountEntitySchema,
  credentialEntitySchema,
  entitiesSchema,
  organizationEntitySchema,
  tokenEntitySchema,
  userEntitySchema,
  userGroupEntitySchema,
  userGroupMemberEntitySchema,
  userRoleSchema,
  userWalletEntitySchema,
  walletEntitySchema,
  walletGroupEntitySchema,
  walletGroupMemberEntitySchema
} from '../schema/entity.schema'

export const UserRole = userRoleSchema.enum

export type UserRole = z.infer<typeof userRoleSchema>

export const AccountType = accountTypeSchema.enum

export type AccountType = z.infer<typeof accountTypeSchema>

export const AccountClassification = accountClassificationSchema.enum

export type AccountClassification = z.infer<typeof accountClassificationSchema>

export type CredentialEntity = z.infer<typeof credentialEntitySchema>

export type OrganizationEntity = z.infer<typeof organizationEntitySchema>

export type UserEntity = z.infer<typeof userEntitySchema>

export type UserGroupEntity = z.infer<typeof userGroupEntitySchema>

export type UserWalletEntity = z.infer<typeof userWalletEntitySchema>

export type UserGroupMemberEntity = z.infer<typeof userGroupMemberEntitySchema>

export type WalletEntity = z.infer<typeof walletEntitySchema>

export type WalletGroupEntity = z.infer<typeof walletGroupEntitySchema>

export type WalletGroupMemberEntity = z.infer<typeof walletGroupMemberEntitySchema>

export type AddressBookAccountEntity = z.infer<typeof addressBookAccountEntitySchema>

export type TokenEntity = z.infer<typeof tokenEntitySchema>

export type Entities = z.infer<typeof entitiesSchema>
