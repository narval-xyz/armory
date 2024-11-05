import { z } from 'zod'
import { accountGroupEntitySchema, userGroupEntitySchema } from '../schema/entity.schema.v1';
import {
  accountClassificationSchema,
  accountEntitySchema,
  accountGroupMemberEntitySchema,
  accountTypeSchema,
  addressBookAccountEntitySchema,
  clientEntitySchema,
  tokenEntitySchema,
  userAccountEntitySchema,
  userEntitySchema,
  userGroupMemberEntitySchema,
  userRoleSchema
} from '../schema/entity.schema.v1'
import { credentialEntitySchema } from '../schema/credential.schema';

export const UserRole = userRoleSchema.enum

export type UserRole = z.infer<typeof userRoleSchema>

export const AccountType = accountTypeSchema.enum

export type AccountType = z.infer<typeof accountTypeSchema>

export const AccountClassification = accountClassificationSchema.enum

export type AccountClassification = z.infer<typeof accountClassificationSchema>

export type CredentialEntity = z.infer<typeof credentialEntitySchema>

export type ClientEntity = z.infer<typeof clientEntitySchema>

export type UserEntity = z.infer<typeof userEntitySchema>

export type AccountGroupEntity = z.infer<typeof accountGroupEntitySchema>

export type UserGroupEntity = z.infer<typeof userGroupEntitySchema>

export type UserAccountEntity = z.infer<typeof userAccountEntitySchema>

export type UserGroupMemberEntity = z.infer<typeof userGroupMemberEntitySchema>

export type AccountEntity = z.infer<typeof accountEntitySchema>

export type AccountGroupMemberEntity = z.infer<typeof accountGroupMemberEntitySchema>

export type AddressBookAccountEntity = z.infer<typeof addressBookAccountEntitySchema>

export type TokenEntity = z.infer<typeof tokenEntitySchema>
