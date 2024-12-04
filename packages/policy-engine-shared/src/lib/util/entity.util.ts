import { countBy, flatten, indexBy, keys, map, pickBy } from 'lodash/fp'
import { entitiesSchema } from '../schema/entity.schema'
import { AccountEntity, CredentialEntity, Entities, UserAccountEntity, UserEntity } from '../type/entity.type'

const Severity = {
  ERROR: 'error',
  WARNING: 'warning'
} as const
type Severity = (typeof Severity)[keyof typeof Severity]

export type ValidationIssue = {
  code: string
  message: string
  severity: Severity
}

export type Validation = { success: true; issues?: ValidationIssue[] } | { success: false; issues: ValidationIssue[] }

export type Validator = (entities: Entities) => ValidationIssue[]

export type ValidationOption = {
  validators?: Validator[]
}

const validateGroupMemberIntegrity: Validator = (entities: Entities): ValidationIssue[] => {
  const users = indexBy('id', entities.users)
  const accounts = indexBy('id', entities.accounts)
  const groups = indexBy('id', entities.groups)
  const groupMembers = entities.groupMembers || []

  const newGroupMemberIssues = groupMembers.flatMap((member) => {
    const validations: ValidationIssue[] = []

    if (!groups[member.groupId]) {
      validations.push({
        code: 'ENTITY_NOT_FOUND',
        message: `couldn't create the group member because the group ${member.groupId} is undefined`,
        severity: Severity.ERROR
      })
    }

    if (member.type === 'user' && !users[member.userId]) {
      validations.push({
        code: 'ENTITY_NOT_FOUND',
        message: `couldn't create the user group member for group ${member.groupId} because the user ${member.userId} is undefined`,
        severity: Severity.ERROR
      })
    }

    if (member.type === 'account' && !accounts[member.accountId]) {
      validations.push({
        code: 'ENTITY_NOT_FOUND',
        message: `couldn't create the account group member for group ${member.groupId} because the account ${member.accountId} is undefined`,
        severity: Severity.ERROR
      })
    }

    return validations
  })

  const legacyUserGroups = indexBy('id', entities.userGroups)
  const legacyAccountGroups = indexBy('id', entities.accountGroups)
  const legacyUserGroupMembers = entities.userGroupMembers || []
  const legacyAccountGroupMembers = entities.accountGroupMembers || []

  // Validate user group members
  const userIssues: ValidationIssue[] = legacyUserGroupMembers
    .filter(({ userId }) => !users[userId])
    .map(({ userId, groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't create the user group member for group ${groupId} because the user ${userId} is undefined`,
      severity: Severity.ERROR
    }))

  const userGroupIssues: ValidationIssue[] = legacyUserGroupMembers
    .filter(({ groupId }) => !legacyUserGroups[groupId])
    .map(({ groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't create the user group member because the group ${groupId} is undefined`,
      severity: Severity.ERROR
    }))

  // Validate account group members
  const accountIssues: ValidationIssue[] = legacyAccountGroupMembers
    .filter(({ accountId }) => !accounts[accountId])
    .map(({ accountId, groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't create the account group member for group ${groupId} because the account ${accountId} is undefined`,
      severity: Severity.ERROR
    }))

  const accountGroupIssues: ValidationIssue[] = legacyAccountGroupMembers
    .filter(({ groupId }) => !legacyAccountGroups[groupId])
    .map(({ groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't create the account group member because the group ${groupId} is undefined`,
      severity: Severity.ERROR
    }))

  return [...userIssues, ...userGroupIssues, ...accountIssues, ...accountGroupIssues, ...newGroupMemberIssues]
}

const validateUserAccountIntegrity: Validator = (entities: Entities): ValidationIssue[] => {
  const accounts = indexBy('id', entities.accounts)
  const users = indexBy('id', entities.users)

  const userIssues: ValidationIssue[] = entities.userAccounts
    .filter(({ userId }) => !users[userId])
    .map(({ userId, accountId: accountId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't assign the account ${accountId} because the user ${userId} is undefined`,
      severity: Severity.ERROR
    }))

  const accountIssues: ValidationIssue[] = entities.userAccounts
    .filter(({ accountId: accountId }) => !accounts[accountId])
    .map(({ accountId: accountId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't assign the account ${accountId} because it's undefined`,
      severity: Severity.ERROR
    }))

  return [...userIssues, ...accountIssues]
}

const validateUniqueIdDuplication: Validator = (entities: Entities): ValidationIssue[] => {
  const code = 'UNIQUE_IDENTIFIER_DUPLICATION'

  const findIssues = <T extends { id: string }[]>(values: T, message: (uid: string) => string): ValidationIssue[] => {
    return map(
      (uid) => ({
        code,
        message: message(uid),
        severity: Severity.ERROR
      }),
      keys(pickBy((count: number) => count > 1, countBy('id', values)))
    )
  }

  return flatten([
    findIssues(entities.addressBook, (id) => `the address book account ${id} is duplicated`),
    findIssues(entities.credentials, (id) => `the credential ${id} is duplicated`),
    findIssues(entities.tokens, (id) => `the token ${id} is duplicated`),
    findIssues(entities.groups || [], (id) => `the group ${id} is duplicated`),
    findIssues(entities.accountGroups || [], (id) => `the legacy user group ${id} is duplicated`),
    findIssues(entities.userGroups || [], (id) => `the legacy account group ${id} is duplicated`),
    findIssues(entities.users, (id) => `the user ${id} is duplicated`),
    findIssues(entities.accounts, (id) => `the account ${id} is duplicated`)
  ])
}

const validateEntityVersion: Validator = (entities: Entities): ValidationIssue[] => {
  const code = 'DEPRECATED_ENTITY'
  const userGroupIssues: ValidationIssue[] =
    entities.userGroups?.map((group) => ({
      code,
      message: `user group is deprecated. Please move user group '${group.id}' to group entity`,
      severity: Severity.WARNING
    })) || []

  const accountGroupIssues: ValidationIssue[] =
    entities.accountGroups?.map((group) => ({
      code,
      message: `account group is deprecated. Please move account group '${group.id}' to group entity`,
      severity: Severity.WARNING
    })) || []

  const userMemberIssues: ValidationIssue[] =
    entities.userGroupMembers?.map((member) => ({
      code,
      message: `user group member is deprecated. Please move user group member '${member.userId}' to group member entity`,
      severity: Severity.WARNING
    })) || []

  const accountMemberIssues: ValidationIssue[] =
    entities.accountGroupMembers?.map((member) => ({
      code,
      message: `account group member is deprecated. Please move account group member '${member.accountId}' to group member entity`,
      severity: Severity.WARNING
    })) || []

  return [...userGroupIssues, ...accountGroupIssues, ...userMemberIssues, ...accountMemberIssues]
}

export const DEFAULT_VALIDATORS: Validator[] = [
  validateGroupMemberIntegrity,
  validateUserAccountIntegrity,
  validateUniqueIdDuplication,
  validateEntityVersion
  // TODO (@wcalderipe, 21/02/25): Missing domain invariants to be validate
  // - fails when root user does not have a credential
  // - fails when credential does not have a user
]

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

export const validate = (entities: Entities, options?: ValidationOption): Validation => {
  const validators = options?.validators || DEFAULT_VALIDATORS

  const result = entitiesSchema.safeParse(entities)

  if (result.success) {
    const issues = validators.flatMap((validation) => validation(entities))

    if (issues.length && issues.some(({ severity }) => severity === Severity.ERROR)) {
      return {
        success: false,
        issues
      }
    } else if (issues.length && issues.every(({ severity }) => severity === Severity.WARNING)) {
      return {
        success: true,
        issues
      }
    }

    return {
      success: true
    }
  }

  const schemaIssues = result.error?.issues.filter(isDefined).map((issue) => ({
    code: issue.code,
    message: issue.message,
    severity: Severity.ERROR
  }))

  return {
    success: false,
    issues: schemaIssues || []
  }
}

export const empty = (): Entities => ({
  addressBook: [],
  credentials: [],
  tokens: [],
  userGroupMembers: [],
  groupMembers: [],
  userAccounts: [],
  users: [],
  accountGroupMembers: [],
  accounts: [],
  userGroups: [],
  accountGroups: [],
  groups: []
})

export const removeUserById = (entities: Entities, userId: string): Entities => {
  return {
    ...entities,
    addressBook: entities.addressBook.filter((entry) => entry.id !== userId),
    credentials: entities.credentials.filter((cred) => cred.userId !== userId),
    userAccounts: entities.userAccounts.filter((userAccount) => userAccount.userId !== userId),
    userGroupMembers: (entities.userGroupMembers || []).filter((userGroup) => userGroup.userId !== userId),
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
