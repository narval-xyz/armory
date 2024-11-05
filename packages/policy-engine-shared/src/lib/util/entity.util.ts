import { entitiesV1Schema, entitiesV2Schema, EntityVersion, getEntitySchema } from '../schema/entity.schema'
import {
  AccountEntity,
  CredentialEntity,
  Entities,
  EntitiesV,
  UserAccountEntity,
  UserEntity
} from '../type/entity.type'
import { isV1, Validation, Validator } from './validation.types'
import { V1_VALIDATORS } from './validators.v1'
import { V2_VALIDATORS } from './validators.v2'

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

export const isVersion =
  <Version extends EntityVersion>(version: Version) =>
  (entities: Entities): entities is EntitiesV<Version> =>
    getEntitySchema(version).safeParse(entities).success

export const VALIDATORS: {
  [V in EntityVersion]: Validator<V>[]
} = {
  '1': V1_VALIDATORS,
  '2': V2_VALIDATORS
}

export const findEntityVersion = (entities: Entities): { version: EntityVersion } =>
  !entities.version ? { version: '1' } : { version: entities.version }

export const validate = (entities: Entities): Validation => {
  const { version } = findEntityVersion(entities)

  const schema = getEntitySchema(version)

  const result = schema.safeParse(entities)

  if (result.success) {
    const validators = VALIDATORS[version] as Validator<typeof version>[]
    const issues = validators.flatMap((validation) => validation(result.data))

    if (issues.length) {
      return {
        success: false,
        issues
      }
    }

    return {
      success: true
    }
  }

  const schemaIssues = result.error?.issues.filter(isDefined).map((issue) => ({
    code: issue.code,
    message: issue.message
  }))

  return {
    success: false,
    issues: schemaIssues || []
  }
}

export const emptyV2 = (): EntitiesV<'2'> => ({
  version: '2',
  addressBook: [],
  credentials: [],
  tokens: [],
  userGroupMembers: [],
  userAccounts: [],
  users: [],
  groups: [],
  accountGroupMembers: [],
  accounts: []
})

export const emptyV1 = (): EntitiesV<'1'> => ({
  version: '1',
  addressBook: [],
  credentials: [],
  tokens: [],
  userGroupMembers: [],
  userAccounts: [],
  users: [],
  accountGroups: [],
  userGroups: [],
  accountGroupMembers: [],
  accounts: []
})

export const populate = (entities: Partial<Entities>): Entities => {
  if (isV1(entities)) {
    return entitiesV1Schema.parse({
      ...emptyV1(),
      ...entities
    })
  }

  return entitiesV2Schema.parse({
    ...emptyV2(),
    ...entities
  })
}

export const removeUserById = (entities: Entities, userId: string): Entities => {
  return {
    ...entities,
    addressBook: entities.addressBook.filter((entry) => entry.id !== userId),
    credentials: entities.credentials.filter((cred) => cred.userId !== userId),
    userAccounts: entities.userAccounts.filter((userAccount) => userAccount.userId !== userId),
    userGroupMembers: entities.userGroupMembers.filter((userGroup) => userGroup.userId !== userId),
    users: entities.users.filter((user) => user.id !== userId)
  }
}

export const removeCredentialById = (entities: Entities, credId: string): Entities => {
  return {
    ...entities,
    credentials: entities.credentials.filter((cred) => cred.id !== credId)
  }
}

export const removeAccountById = (entities: Entities, accountId: string): Entities => {
  return {
    ...entities,
    accounts: entities.accounts.filter((account) => account.id !== accountId),
    userAccounts: entities.userAccounts.filter((userAccount) => userAccount.accountId !== accountId)
  }
}

export const updateUser = (entities: Entities, user: UserEntity): Entities => {
  return {
    ...entities,
    users: entities.users.map((u) => {
      if (u.id === user.id) {
        return user
      }

      return u
    })
  }
}

export const getUserAssignedAccounts = (entities: Entities, user: UserEntity): AccountEntity[] => {
  const userAccounts = entities.userAccounts
    .filter(({ userId }) => userId === user.id)
    .map(({ accountId }) => accountId)

  return entities.accounts.filter(({ id }) => userAccounts.indexOf(id) !== -1)
}

export const getUserAccounts = (entities: Entities, user: UserEntity): UserAccountEntity[] => {
  return entities.userAccounts.filter(({ userId }) => userId === user.id)
}

export const getUserCredentials = (entities: Entities, user: UserEntity): CredentialEntity[] => {
  return entities.credentials.filter(({ userId }) => userId === user.id)
}

export const updateUserAccounts = (
  entities: Entities,
  user: UserEntity,
  userAccounts: UserAccountEntity[]
): Entities => {
  const notAssignedToUser = entities.userAccounts.filter(({ userId }) => userId !== user.id)

  return {
    ...entities,
    userAccounts: [...notAssignedToUser, ...userAccounts]
  }
}

export const addAccount = (entities: Entities, account: AccountEntity): Entities => ({
  ...entities,
  accounts: [...entities.accounts, account]
})

export const addAccounts = (entities: Entities, accounts: AccountEntity[]): Entities => ({
  ...entities,
  accounts: [...entities.accounts, ...accounts]
})
