import {
  Action,
  CredentialEntity,
  Entities,
  EvaluationRequest,
  Feed,
  Request,
  SerializedTransactionRequest,
  SetEntitiesAction,
  SetPoliciesAction,
  SignMessageAction,
  SignRawAction,
  SignTransactionAction,
  SignTypedDataAction
} from '@narval/policy-engine-shared'
import { InputType, safeDecode } from '@narval/transaction-request-intent'
import { HttpStatus } from '@nestjs/common'
import { indexBy } from 'lodash/fp'
import { OpenPolicyAgentException } from '../exception/open-policy-agent.exception'
import { Data, Input, UserGroup, WalletGroup } from '../type/open-policy-agent.type'

type Mapping<R extends Request> = (
  request: R,
  principal: CredentialEntity,
  approvals?: CredentialEntity[],
  feeds?: Feed<unknown>[]
) => Input

const toMetaPermission: Mapping<SetEntitiesAction | SetPoliciesAction> = (request, principal, approvals): Input => {
  return {
    action: request.action,
    principal,
    approvals
  }
}

const toSignTransaction: Mapping<SignTransactionAction> = (request, principal, approvals, feeds): Input => {
  const result = safeDecode({
    input: {
      type: InputType.TRANSACTION_REQUEST,
      txRequest: request.transactionRequest
    }
  })

  if (result.success) {
    return {
      action: Action.SIGN_TRANSACTION,
      principal,
      approvals,
      intent: result.intent,
      transactionRequest: SerializedTransactionRequest.parse(request.transactionRequest),
      resource: { uid: request.resourceId },
      feeds
    }
  }

  throw new OpenPolicyAgentException({
    message: 'Invalid transaction request intent',
    suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
    context: { error: result.error }
  })
}

const toSignTypedData: Mapping<SignTypedDataAction> = (request, principal, approvals): Input => {
  const result = safeDecode({
    input: {
      type: InputType.TYPED_DATA,
      typedData: request.typedData
    }
  })

  if (result.success) {
    return {
      action: Action.SIGN_TYPED_DATA,
      principal,
      approvals,
      intent: result.intent,
      resource: { uid: request.resourceId }
    }
  }

  throw new OpenPolicyAgentException({
    message: 'Invalid transaction request intent',
    suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
    context: { error: result.error }
  })
}

const toSignMessageOrSignRaw = (params: {
  action: Action
  request: SignMessageAction | SignRawAction
  principal: CredentialEntity
  approvals?: CredentialEntity[]
}): Input => {
  const { action, request, principal, approvals } = params
  return {
    action,
    principal,
    approvals,
    resource: { uid: request.resourceId }
  }
}

const toSignMessage: Mapping<SignMessageAction> = (request, principal, approvals): Input =>
  toSignMessageOrSignRaw({ action: Action.SIGN_MESSAGE, request, principal, approvals })

const toSignRaw: Mapping<SignMessageAction> = (request, principal, approvals): Input =>
  toSignMessageOrSignRaw({ action: Action.SIGN_RAW, request, principal, approvals })

export const toInput = (params: {
  evaluation: EvaluationRequest
  principal: CredentialEntity
  approvals?: CredentialEntity[]
}): Input => {
  const { evaluation } = params
  const { action } = evaluation.request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mappers = new Map<Action, Mapping<any>>([
    [Action.SIGN_MESSAGE, toSignMessage],
    [Action.SIGN_RAW, toSignRaw],
    [Action.SIGN_TRANSACTION, toSignTransaction],
    [Action.SIGN_TYPED_DATA, toSignTypedData],
    [Action.SET_ENTITIES, toMetaPermission],
    [Action.SET_POLICIES, toMetaPermission]
  ])
  const mapper = mappers.get(action)

  if (mapper) {
    return mapper(evaluation.request, params.principal, params.approvals, evaluation.feeds)
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
