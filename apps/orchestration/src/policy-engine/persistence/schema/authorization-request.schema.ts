import { Action } from '@app/orchestration/policy-engine/core/type/domain.type'
import {
  createSignMessageRequestSchema,
  readSignMessageRequestSchema
} from '@app/orchestration/policy-engine/persistence/schema/sign-message-request.schema'
import {
  createSignTransactionRequestSchema,
  readSignTransactionRequestSchema
} from '@app/orchestration/policy-engine/persistence/schema/sign-transaction-request.schema'
import { AuthorizationRequestStatus } from '@prisma/client/orchestration'
import { z } from 'zod'

const evaluationSchema = z.object({
  id: z.string().uuid(),
  decision: z.string(),
  signature: z.string().nullable(),
  createdAt: z.date()
})

const sharedAuthorizationRequestSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  initiatorId: z.string().uuid(),
  status: z.nativeEnum(AuthorizationRequestStatus),
  hash: z.string(),
  idempotencyKey: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  evaluations: z.array(evaluationSchema)
})

export const readAuthorizationRequestSchema = z.discriminatedUnion('action', [
  sharedAuthorizationRequestSchema.extend({
    action: z.literal(Action.SIGN_MESSAGE),
    request: readSignMessageRequestSchema
  }),
  sharedAuthorizationRequestSchema.extend({
    action: z.literal(Action.SIGN_TRANSACTION),
    request: readSignTransactionRequestSchema
  })
])

const createSharedAuthorizationRequestSchema = sharedAuthorizationRequestSchema.partial({
  status: true
})

export const createAuthorizationRequestSchema = z.discriminatedUnion('action', [
  createSharedAuthorizationRequestSchema.extend({
    action: z.literal(Action.SIGN_MESSAGE),
    request: createSignMessageRequestSchema
  }),
  createSharedAuthorizationRequestSchema.extend({
    action: z.literal(Action.SIGN_TRANSACTION),
    request: createSignTransactionRequestSchema
  })
])

/**
 * Only allow updating a few attributes of the authorization request.
 *
 * This restriction is in place because altering the data of an authorization
 * request would mean tampering with the user's original request.
 */
export const updateAuthorizationRequestSchema = sharedAuthorizationRequestSchema
  .pick({
    id: true,
    orgId: true,
    status: true,
    evaluations: true
  })
  .partial()
