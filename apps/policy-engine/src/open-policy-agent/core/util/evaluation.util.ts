import {
  Action,
  CredentialEntity,
  Entities,
  EvaluationRequest,
  Feed,
  GrantPermissionAction,
  Request,
  SerializedTransactionRequest,
  SignMessageAction,
  SignRawAction,
  SignTransactionAction,
  SignTypedDataAction,
  SignUserOperationAction
} from '@narval/policy-engine-shared'
import { InputType, Intents, SUPPORTED_METHODS, SupportedMethodId, safeDecode } from '@narval/transaction-request-intent'
import { HttpStatus } from '@nestjs/common'
import { indexBy } from 'lodash/fp'
import { OpenPolicyAgentException } from '../exception/open-policy-agent.exception'
import { AccountGroup, Data, Input, UserGroup } from '../type/open-policy-agent.type'
import { Abi, encodeFunctionData } from 'viem'
import { getUserOperationHash } from "permissionless/utils"
import { EntryPoint } from "permissionless/types"
import { Alg } from '@narval/signature'


type Mapping<R extends Request> = (
  request: R,
  principal: CredentialEntity,
  approvals?: CredentialEntity[],
  feeds?: Feed<unknown>[]
) => Input

const userOperationToSignTransaction: Mapping<SignUserOperationAction> = (request, principal, approvals, feeds): Input => {
  const { chainId, entryPoint, ...userOpToBeHashed} = request.userOperation

  const abi: Abi = [{
"inputs":[
{
"components":[
{
"internalType":"address",
"name":"sender",
"type":"address"
},
{
"internalType":"uint256",
"name":"nonce",
"type":"uint256"
},
{
"internalType":"bytes",
"name":"initCode",
"type":"bytes"
},
{
"internalType":"bytes",
"name":"callData",
"type":"bytes"
},
{
"internalType":"uint256",
"name":"callGasLimit",
"type":"uint256"
},
{
"internalType":"uint256",
"name":"verificationGasLimit",
"type":"uint256"
},
{
"internalType":"uint256",
"name":"preVerificationGas",
"type":"uint256"
},
{
"internalType":"uint256",
"name":"maxFeePerGas",
"type":"uint256"
},
{
"internalType":"uint256",
"name":"maxPriorityFeePerGas",
"type":"uint256"
},
{
"internalType":"bytes",
"name":"paymasterAndData",
"type":"bytes"
},
{
"internalType":"bytes",
"name":"signature",
"type":"bytes"
}
],
"internalType":"struct UserOperation[]",
"name":"ops",
"type":"tuple[]"
},
{
"internalType":"address payable",
"name":"beneficiary",
"type":"address"
}
],
"name":"handleOps",
"outputs":[
],
"stateMutability":"nonpayable",
"type":"function"
  }]
  const data = encodeFunctionData({
    abi,
    functionName: 'handleOps',
    args: [[request.userOperation], '0x3f843E606C79312718477F9bC020F3fC5b7264C2']
  })

  const result = safeDecode({
    input: {
      type: InputType.TRANSACTION_REQUEST,
      txRequest: {
        from: request.userOperation.sender,
        chainId: +chainId,
        data,
      }
    }
  })

  console.log('###result', result)

  return {
    action: Action.SIGN_USER_OPERATION,
    principal,
    approvals,
  }
}
// !!TODO: Change that to a UserOperation specific type

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
    [Action.SIGN_USER_OPERATION, userOperationToSignTransaction],
    [Action.GRANT_PERMISSION, toGrantPermission]
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

  const accountGroups = entities.accountGroupMembers.reduce((groups, { accountId, groupId }) => {
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

  return {
    entities: {
      addressBook: indexBy('id', entities.addressBook),
      tokens: indexBy('id', entities.tokens),
      users: indexBy('id', entities.users),
      userGroups: Object.fromEntries(userGroups),
      accounts: indexBy('id', entities.accounts),
      accountGroups: Object.fromEntries(accountGroups)
    }
  }
}
