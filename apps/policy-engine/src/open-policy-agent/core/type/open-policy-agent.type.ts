import {
  AccountEntity,
  AccountGroupEntity,
  Action,
  AddressBookAccountEntity,
  CredentialEntity,
  Feed,
  SerializedTransactionRequest,
  SerializedUserOperationV6,
  TokenEntity,
  UserEntity,
  UserGroupEntity
} from '@narval/policy-engine-shared'
import { Intent } from '@narval/transaction-request-intent'
import { loadPolicy } from '@open-policy-agent/opa-wasm'
import { z } from 'zod'
import { resultSchema } from '../schema/open-policy-agent.schema'

type PromiseType<T extends Promise<unknown>> = T extends Promise<infer U> ? U : never

export type OpenPolicyAgentInstance = PromiseType<ReturnType<typeof loadPolicy>>

export type Input = {
  action: Action
  principal: CredentialEntity
  resource?: { uid: string }
  intent?: Intent
  transactionRequest?: SerializedTransactionRequest
  userOperation?: SerializedUserOperationV6
  permissions?: string[]
  approvals?: CredentialEntity[]
  feeds?: Feed<unknown>[]
}

// TODO: (@wcalderipe, 18/03/24) Check with @samteb how can we replace these
// types by entities defined at @narval/policy-engine-shared.

export type UserGroup = UserGroupEntity & {
  users: string[] // userIds
}

export type Account = AccountEntity & {
  assignees: string[] // userIds
}

export type AccountGroup = AccountGroupEntity & {
  accounts: string[] // accountIds
}

export type Data = {
  entities: {
    addressBook: Record<string, AddressBookAccountEntity>
    tokens: Record<string, TokenEntity>
    users: Record<string, UserEntity>
    userGroups: Record<string, UserGroup>
    accounts: Record<string, Account>
    accountGroups: Record<string, AccountGroupEntity>
  }
}

export type Result = z.infer<typeof resultSchema>
