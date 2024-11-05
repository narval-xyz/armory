import { countBy, flatten, indexBy, keys, map, pickBy } from 'lodash/fp'
import { EntitiesV } from '../schema/entity.schema.shared'
import { ValidationIssue, Validator } from './validation.types'

const validateUserGroupMemberIntegrity: Validator<'1'> = (entities: EntitiesV<'1'>): ValidationIssue[] => {
  const users = indexBy('id', entities.users)
  const userGroups = indexBy('id', entities.userGroups)

  const userIssues: ValidationIssue[] = entities.userGroupMembers
    .filter(({ userId }) => !users[userId])
    .map(({ userId, groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't create the user group member for group ${groupId} because the user ${userId} is undefined`
    }))

  const groupIssues: ValidationIssue[] = entities.userGroupMembers
    .filter(({ groupId }) => !userGroups[groupId])
    .map(({ groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't create the user group member because the group ${groupId} is undefined`
    }))

  return [...userIssues, ...groupIssues]
}

const validateAccountGroupMemberIntegrity: Validator<'1'> = (entities: EntitiesV<'1'>): ValidationIssue[] => {
  const accounts = indexBy('id', entities.accounts)
  const accountGroups = indexBy('id', entities.accountGroups)

  const accountIssues: ValidationIssue[] = entities.accountGroupMembers
    .filter(({ accountId: accountId }) => !accounts[accountId])
    .map(({ accountId: accountId, groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't create the account group member for group ${groupId} because the account ${accountId} is undefined`
    }))

  const groupIssues: ValidationIssue[] = entities.accountGroupMembers
    .filter(({ groupId }) => !accountGroups[groupId])
    .map(({ groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't create the account group member because the group ${groupId} is undefined`
    }))

  return [...accountIssues, ...groupIssues]
}

const validateUserAccountIntegrity: Validator<'1'> = (entities: EntitiesV<'1'>): ValidationIssue[] => {
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

const validateUniqueIdDuplication: Validator<'1'> = (entities: EntitiesV<'1'>): ValidationIssue[] => {
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
    findIssues(entities.userGroups, (id) => `the user group ${id} is duplicated`),
    findIssues(entities.users, (id) => `the user ${id} is duplicated`),
    findIssues(entities.accountGroups, (id) => `the account group ${id} is duplicated`),
    findIssues(entities.accounts, (id) => `the account ${id} is duplicated`)
  ])
}

export const V1_VALIDATORS = [
  validateUserGroupMemberIntegrity,
  validateAccountGroupMemberIntegrity,
  validateUserAccountIntegrity,
  validateUniqueIdDuplication
]
