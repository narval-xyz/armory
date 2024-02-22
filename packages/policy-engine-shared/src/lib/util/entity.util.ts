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
  const users = indexBy('uid', entities.users)
  const userGroups = indexBy('uid', entities.userGroups)

  const userIssues: ValidationIssue[] = entities.userGroupMembers
    .filter(({ userId }) => !users[userId])
    .map(({ userId, groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `Couldn't create the user group member for group ${groupId} because the user ${userId} is undefined`
    }))

  const groupIssues: ValidationIssue[] = entities.userGroupMembers
    .filter(({ groupId }) => !userGroups[groupId])
    .map(({ groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `Couldn't create the user group member because the group ${groupId} is undefined`
    }))

  return [...userIssues, ...groupIssues]
}

const validateWalletGroupMemberIntegrity: Validator = (entities: Entities): ValidationIssue[] => {
  const wallets = indexBy('uid', entities.wallets)
  const walletGroups = indexBy('uid', entities.walletGroups)

  const walletIssues: ValidationIssue[] = entities.walletGroupMembers
    .filter(({ walletId }) => !wallets[walletId])
    .map(({ walletId, groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `Couldn't create the wallet group member for group ${groupId} because the wallet ${walletId} is undefined`
    }))

  const groupIssues: ValidationIssue[] = entities.walletGroupMembers
    .filter(({ groupId }) => !walletGroups[groupId])
    .map(({ groupId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `Couldn't create the wallet group member because the group ${groupId} is undefined`
    }))

  return [...walletIssues, ...groupIssues]
}

const validateUserWalletIntegrity: Validator = (entities: Entities): ValidationIssue[] => {
  const wallets = indexBy('uid', entities.wallets)
  const users = indexBy('uid', entities.users)

  const userIssues: ValidationIssue[] = entities.userWallets
    .filter(({ userId }) => !users[userId])
    .map(({ userId, walletId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `Couldn't assign the wallet ${walletId} because the user ${userId} is undefined`
    }))

  const walletIssues: ValidationIssue[] = entities.userWallets
    .filter(({ walletId }) => !wallets[walletId])
    .map(({ walletId }) => ({
      code: 'ENTITY_NOT_FOUND',
      message: `Couldn't assign the wallet ${walletId} because it's undefined`
    }))

  return [...userIssues, ...walletIssues]
}

const validateUniqueIdDuplication: Validator = (entities: Entities): ValidationIssue[] => {
  const code = 'UNIQUE_IDENTIFIER_DUPLICATION'

  const findIssues = <T extends { uid: string }[]>(values: T, message: (uid: string) => string): ValidationIssue[] => {
    return map(
      (uid) => ({
        code,
        message: message(uid)
      }),
      keys(pickBy((count: number) => count > 1, countBy('uid', values)))
    )
  }

  return flatten([
    findIssues(entities.addressBook, (uid) => `The address book account ${uid} is duplicated`),
    findIssues(entities.credentials, (uid) => `The credential ${uid} is duplicated`),
    findIssues(entities.tokens, (uid) => `The token ${uid} is duplicated`),
    findIssues(entities.userGroups, (uid) => `The user group ${uid} is duplicated`),
    findIssues(entities.users, (uid) => `The user ${uid} is duplicated`),
    findIssues(entities.walletGroups, (uid) => `The wallet group ${uid} is duplicated`),
    findIssues(entities.wallets, (uid) => `The wallet ${uid} is duplicated`)
  ])
}

const validateAddressBookUniqueIdFormat: Validator = (entities: Entities): ValidationIssue[] => {
  return entities.addressBook
    .filter(({ uid }) => !isAccountId(uid))
    .map(({ uid }) => {
      return {
        code: 'INVALID_UID_FORMAT',
        message: `address book account uid ${uid} is not a valid account id`
      }
    })
}

const validateTokenUniqueIdFormat: Validator = (entities: Entities): ValidationIssue[] => {
  return entities.tokens
    .filter(({ uid }) => !isAssetId(uid))
    .map(({ uid }) => {
      return {
        code: 'INVALID_UID_FORMAT',
        message: `token uid ${uid} is not a valid asset id`
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
