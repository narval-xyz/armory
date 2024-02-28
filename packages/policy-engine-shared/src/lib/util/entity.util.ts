import { countBy, flatten, indexBy, keys, map, pickBy } from 'lodash/fp'
import { Entities } from '../type/entity.type'
import { isAccountId, isAssetId } from './caip.util'

export type ValidationIssue = {
  code: string
  message: string
}

export type Validation = { success: true } | { success: false; issues: ValidationIssue[] }

export type Validator = (entities: Entities) => ValidationIssue[]

export type ValidationOption = {
  validators?: Validator[]
}

const validateUserGroupMemberIntegrity: Validator = (entities: Entities): ValidationIssue[] => {
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

const validateWalletGroupMemberIntegrity: Validator = (entities: Entities): ValidationIssue[] => {
  const wallets = indexBy('id', entities.wallets)
  const walletGroups = indexBy('id', entities.walletGroups)

  const walletIssues: ValidationIssue[] = entities.walletGroupMembers
    .filter(({ walletId }) => !wallets[walletId])
    .map(({ walletId, groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't create the wallet group member for group ${groupId} because the wallet ${walletId} is undefined`
    }))

  const groupIssues: ValidationIssue[] = entities.walletGroupMembers
    .filter(({ groupId }) => !walletGroups[groupId])
    .map(({ groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't create the wallet group member because the group ${groupId} is undefined`
    }))

  return [...walletIssues, ...groupIssues]
}

const validateUserWalletIntegrity: Validator = (entities: Entities): ValidationIssue[] => {
  const wallets = indexBy('id', entities.wallets)
  const users = indexBy('id', entities.users)

  const userIssues: ValidationIssue[] = entities.userWallets
    .filter(({ userId }) => !users[userId])
    .map(({ userId, walletId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't assign the wallet ${walletId} because the user ${userId} is undefined`
    }))

  const walletIssues: ValidationIssue[] = entities.userWallets
    .filter(({ walletId }) => !wallets[walletId])
    .map(({ walletId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `couldn't assign the wallet ${walletId} because it's undefined`
    }))

  return [...userIssues, ...walletIssues]
}

const validateUniqueIdDuplication: Validator = (entities: Entities): ValidationIssue[] => {
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
    findIssues(entities.walletGroups, (id) => `the wallet group ${id} is duplicated`),
    findIssues(entities.wallets, (id) => `the wallet ${id} is duplicated`)
  ])
}

const validateAddressBookUniqueIdFormat: Validator = (entities: Entities): ValidationIssue[] => {
  return entities.addressBook
    .filter(({ id: uid }) => !isAccountId(uid))
    .map(({ id: uid }) => {
      return {
        code: 'INVALID_UID_FORMAT',
        message: `address book account id ${uid} is not a valid account id`
      }
    })
}

const validateTokenUniqueIdFormat: Validator = (entities: Entities): ValidationIssue[] => {
  return entities.tokens
    .filter(({ id: uid }) => !isAssetId(uid))
    .map(({ id: uid }) => {
      return {
        code: 'INVALID_UID_FORMAT',
        message: `token id ${uid} is not a valid asset id`
      }
    })
}

export const DEFAULT_VALIDATORS: Validator[] = [
  validateUserGroupMemberIntegrity,
  validateWalletGroupMemberIntegrity,
  validateUserWalletIntegrity,
  validateUniqueIdDuplication,
  validateAddressBookUniqueIdFormat,
  validateTokenUniqueIdFormat
  // TODO (@wcalderipe, 21/02/25): Missing domain invariants to be validate
  // - fails when root user does not have a credential
  // - fails when credential does not have a user
]

export const validate = (entities: Entities, options?: ValidationOption): Validation => {
  const validators = options?.validators || DEFAULT_VALIDATORS

  const issues = validators.flatMap((validation) => validation(entities))

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
