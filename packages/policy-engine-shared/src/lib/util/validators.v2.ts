import { countBy, flatten, indexBy, keys, map, pickBy } from 'lodash/fp'
import { EntitiesV } from '../type/entity.type'
import { ValidationIssue, Validator } from './validation.types'

const validateGroupMemberIntegrity: Validator<'2'> = (entities: EntitiesV<'2'>): ValidationIssue[] => {
  const users = indexBy('id', entities.users)
  const accounts = indexBy('id', entities.accounts)
  const groups = indexBy('id', entities.groups)

  // Validate user group members
  const userIssues: ValidationIssue[] = entities.userGroupMembers
    .filter(({ userId }) => !users[userId])
    .map(({ userId, groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't create the user group member for group ${groupId} because the user ${userId} is undefined`
    }))

  const userGroupIssues: ValidationIssue[] = entities.userGroupMembers
    .filter(({ groupId }) => !groups[groupId])
    .map(({ groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't create the user group member because the group ${groupId} is undefined`
    }))

  // Validate account group members
  const accountIssues: ValidationIssue[] = entities.accountGroupMembers
    .filter(({ accountId }) => !accounts[accountId])
    .map(({ accountId, groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't create the account group member for group ${groupId} because the account ${accountId} is undefined`
    }))

  const accountGroupIssues: ValidationIssue[] = entities.accountGroupMembers
    .filter(({ groupId }) => !groups[groupId])
    .map(({ groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't create the account group member because the group ${groupId} is undefined`
    }))

  return [...userIssues, ...userGroupIssues, ...accountIssues, ...accountGroupIssues]
}

const validateUserAccountIntegrity: Validator<'2'> = (entities: EntitiesV<'2'>): ValidationIssue[] => {
  const accounts = indexBy('id', entities.accounts)
  const users = indexBy('id', entities.users)

  const userIssues: ValidationIssue[] = entities.userAccounts
    .filter(({ userId }) => !users[userId])
    .map(({ userId, accountId: accountId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't assign the account ${accountId} because the user ${userId} is undefined`
    }))

  const accountIssues: ValidationIssue[] = entities.userAccounts
    .filter(({ accountId: accountId }) => !accounts[accountId])
    .map(({ accountId: accountId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't assign the account ${accountId} because it's undefined`
    }))

  return [...userIssues, ...accountIssues]
}

const validateUniqueIdDuplication: Validator<'2'> = (entities: EntitiesV<'2'>): ValidationIssue[] => {
  const code = 'UNIQUE_IDENTIFIER_DUPLICATION'

  const findIssues = <T extends { id: string }[]>(values: T, message: (uid: string) => string): ValidationIssue[] => {
    return map(
      (uid) => ({
        code,
        message: message(uid)
      }),
      keys(pickBy((count: number) => count > 1, countBy('id', values)))
    )
  }

  return flatten([
    findIssues(entities.addressBook, (id) => `the address book account ${id} is duplicated`),
    findIssues(entities.credentials, (id) => `the credential ${id} is duplicated`),
    findIssues(entities.tokens, (id) => `the token ${id} is duplicated`),
    findIssues(entities.groups, (id) => `the group ${id} is duplicated`),
    findIssues(entities.users, (id) => `the user ${id} is duplicated`),
    findIssues(entities.accounts, (id) => `the account ${id} is duplicated`)
  ])
}

export const V2_VALIDATORS: Validator<'2'>[] = [
  validateGroupMemberIntegrity,
  validateUserAccountIntegrity,
  validateUniqueIdDuplication
]
