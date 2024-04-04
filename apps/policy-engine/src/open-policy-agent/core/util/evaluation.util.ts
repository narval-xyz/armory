import { Action, CredentialEntity, Entities, EvaluationRequest } from '@narval/policy-engine-shared'
import { InputType, safeDecode } from '@narval/transaction-request-intent'
import { HttpStatus } from '@nestjs/common'
import { indexBy } from 'lodash/fp'
import { OpenPolicyAgentException } from '../exception/open-policy-agent.exception'
import { Data, Input, UserGroup, WalletGroup } from '../type/open-policy-agent.type'

export const toInput = (params: {
  evaluation: EvaluationRequest
  principal: CredentialEntity
  approvals?: CredentialEntity[]
}): Input => {
  const { evaluation, principal, approvals } = params
  const { action } = evaluation.request

  if (action === Action.SIGN_TRANSACTION) {
    const result = safeDecode({
      input: {
        type: InputType.TRANSACTION_REQUEST,
        txRequest: evaluation.request.transactionRequest
      }
    })

    if (result.success) {
      return {
        action,
        principal,
        approvals,
        intent: result.intent,
        transactionRequest: evaluation.request.transactionRequest,
        resource: { uid: evaluation.request.resourceId }
      }
    }

    throw new OpenPolicyAgentException({
      message: 'Invalid transaction request intent',
      suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
      context: { error: result.error }
    })
  }

  if (action === Action.SIGN_MESSAGE) {
    return {
      action,
      principal,
      approvals,
      resource: { uid: evaluation.request.resourceId }
    }
  }

  throw new OpenPolicyAgentException({
    message: 'Unsupported evaluation request action',
    suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    context: { action }
  })
}

export const toData = (entities: Entities): Data => {
  const userGroups = entities.userGroupMembers.reduce((groups, { userId, groupId }) => {
    const group = groups.get(groupId)

    if (group) {
      return groups.set(groupId, {
        id: groupId,
        users: group.users.concat(userId)
      })
    } else {
      return groups.set(groupId, { id: groupId, users: [userId] })
    }
  }, new Map<string, UserGroup>())

  const walletGroups = entities.walletGroupMembers.reduce((groups, { walletId, groupId }) => {
    const group = groups.get(groupId)

    if (group) {
      return groups.set(groupId, {
        id: groupId,
        wallets: group.wallets.concat(walletId)
      })
    } else {
      return groups.set(groupId, { id: groupId, wallets: [walletId] })
    }
  }, new Map<string, WalletGroup>())

  return {
    entities: {
      addressBook: indexBy('id', entities.addressBook),
      tokens: indexBy('id', entities.tokens),
      users: indexBy('id', entities.users),
      userGroups: Object.fromEntries(userGroups),
      wallets: indexBy('id', entities.wallets),
      walletGroups: Object.fromEntries(walletGroups)
    }
  }
}
