import {
  Action,
  CredentialEntity,
  Entities,
  EvaluationRequest,
  Feed,
  GrantPermissionAction,
  Request,
  SerializedTransactionRequest,
  SerializedUserOperationV6,
  SignMessageAction,
  SignRawAction,
  SignTransactionAction,
  SignTypedDataAction,
  SignUserOperationAction
} from '@narval/policy-engine-shared'
import { InputType, safeDecode } from '@narval/transaction-request-intent'
import { HttpStatus } from '@nestjs/common'
import { indexBy } from 'lodash/fp'
import { OpenPolicyAgentException } from '../exception/open-policy-agent.exception'
import { Account, AccountGroup, Data, Group, Input, UserGroup } from '../type/open-policy-agent.type'

type Mapping<R extends Request> = (
  request: R,
  principal: CredentialEntity,
  approvals?: CredentialEntity[],
  feeds?: Feed<unknown>[]
) => Input

const toSignUserOperation: Mapping<SignUserOperationAction> = (request, principal, approvals, feeds): Input => {
  const { chainId, entryPoint } = request.userOperation

  const result = safeDecode({
    input: {
      type: InputType.TRANSACTION_REQUEST,
      txRequest: {
        from: request.userOperation.sender,
        chainId: +chainId,
        data: request.userOperation.callData,
        to: entryPoint
      }
    }
  })

  if (!result.success) {
    throw new OpenPolicyAgentException({
      message: 'Invalid user operation intent',
      suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
      context: { error: result.error }
    })
  }

  return {
    action: Action.SIGN_USER_OPERATION,
    principal,
    intent: result.intent,
    approvals,
    userOperation: SerializedUserOperationV6.parse({
      ...request.userOperation,
      sender: request.userOperation.sender.toLowerCase(),
      factoryAddress: request.userOperation.factoryAddress.toLowerCase(),
      entryPoint: request.userOperation.entryPoint.toLowerCase()
    }),
    resource: { uid: request.resourceId },
    feeds
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
      transactionRequest: SerializedTransactionRequest.parse({
        ...request.transactionRequest,
        to: request.transactionRequest.to?.toLowerCase() || undefined,
        from: request.transactionRequest.from.toLowerCase()
      }),
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

const toGrantPermission: Mapping<GrantPermissionAction> = (request, principal, approvals): Input => {
  return {
    action: request.action,
    principal,
    approvals,
    resource: { uid: request.resourceId },
    permissions: request.permissions
  }
}

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
    [Action.SIGN_USER_OPERATION, toSignUserOperation],
    [Action.GRANT_PERMISSION, toGrantPermission]
  ])
  const mapper = mappers.get(action)

  const lowercasedPrincipal = {
    userId: params.principal.userId.toLowerCase(),
    id: params.principal.id.toLowerCase(),
    key: params.principal.key
  }

  if (mapper) {
    return {
      ...mapper(evaluation.request, lowercasedPrincipal, params.approvals, evaluation.feeds),
      resource: { uid: evaluation.request.resourceId.toLowerCase() }
    }
  }

  throw new OpenPolicyAgentException({
    message: 'Unsupported evaluation request action',
    suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    context: { action }
  })
}

export const toData = (entities: Entities): Data => {
  const userGroupMembers = entities.userGroupMembers || []
  const accountGroupMembers = entities.accountGroupMembers || []
  const groupMembers = entities.groupMembers || []

  const userGroups = userGroupMembers.reduce((groups, { userId, groupId }) => {
    const id = groupId.toLowerCase()
    const group = groups.get(id)

    if (group) {
      return groups.set(id, {
        id: groupId,
        users: group.users.concat(userId)
      })
    } else {
      return groups.set(groupId, { id: groupId, users: [userId] })
    }
  }, new Map<string, UserGroup>())

  const accountAssignees = entities.userAccounts.reduce((assignees, { userId, accountId }) => {
    const account = assignees.get(accountId)

    if (account) {
      return assignees.set(accountId, account.concat(userId))
    } else {
      return assignees.set(accountId, [userId])
    }
  }, new Map<string, string[]>())

  const accounts: Account[] = entities.accounts.map((account) => ({
    ...account,
    assignees: accountAssignees.get(account.id) || []
  }))

  const accountGroups = accountGroupMembers.reduce((groups, { accountId, groupId }) => {
    const group = groups.get(groupId)

    if (group) {
      return groups.set(groupId, {
        id: groupId,
        accounts: group.accounts.concat(accountId)
      })
    } else {
      return groups.set(groupId, { id: groupId, accounts: [accountId] })
    }
  }, new Map<string, AccountGroup>())

  const mergedGroups = groupMembers.reduce((groups, member) => {
    const group = groups.get(member.groupId) ?? {
      id: member.groupId,
      users: [],
      accounts: []
    }

    const newGroup = {
      ...group,
      users: member.type === 'user' ? [...group.users, member.userId] : group.users,
      accounts: member.type === 'account' ? [...group.accounts, member.accountId] : group.accounts
    }

    return groups.set(member.groupId, newGroup)
  }, new Map<string, Group>())

  const data: Data = {
    entities: {
      addressBook: indexBy('id', entities.addressBook),
      tokens: indexBy('id', entities.tokens),
      users: indexBy('id', entities.users),
      userGroups: Object.fromEntries(userGroups),
      accounts: indexBy('id', accounts),
      accountGroups: Object.fromEntries(accountGroups),
      groups: Object.fromEntries(mergedGroups)
    }
  }

  // IMPORTANT: The Data schema converts IDs to lower case because we don't
  // want to be doing defensive programming in Rego.
  return Data.parse(data)
}
