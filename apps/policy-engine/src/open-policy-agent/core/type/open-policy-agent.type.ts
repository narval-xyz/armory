import {
  Action,
  CredentialEntity,
  Feed,
  SerializedTransactionRequest,
  SerializedUserOperationV6,
  accountEntitySchema,
  accountGroupEntitySchema,
  addressBookAccountEntitySchema,
  groupEntitySchema,
  tokenEntitySchema,
  userEntitySchema,
  userGroupEntitySchema
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

// IMPORTANT: Index entities by lower case ID is an important invariant for
// many Rego rules performing a look up on the dataset.
const Id = z.string().toLowerCase()

export const UserGroup = userGroupEntitySchema.extend({
  id: Id,
  users: z.array(Id)
})
export type UserGroup = z.infer<typeof UserGroup>

export const Account = accountEntitySchema.extend({
  id: Id,
  assignees: z.array(Id)
})
export type Account = z.infer<typeof Account>

export const AccountGroup = accountGroupEntitySchema.extend({
  id: Id,
  accounts: z.array(Id)
})
export type AccountGroup = z.infer<typeof AccountGroup>

export const Group = groupEntitySchema.extend({
  id: Id,
  users: z.array(Id),
  accounts: z.array(Id)
})
export type Group = z.infer<typeof Group>

export const Data = z.object({
  entities: z.object({
    addressBook: z.record(Id, addressBookAccountEntitySchema.extend({ id: Id })),
    tokens: z.record(Id, tokenEntitySchema.extend({ id: Id })),
    users: z.record(Id, userEntitySchema.extend({ id: Id })),
    accountGroups: z.record(Id, AccountGroup),
    userGroups: z.record(Id, UserGroup),
    groups: z.record(Id, Group),
    accounts: z.record(Id, Account)
  })
})
export type Data = z.infer<typeof Data>

export type Result = z.infer<typeof resultSchema>
