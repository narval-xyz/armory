import { Decision, Signature, TransactionRequest } from '@narval/authz-shared'
import { AuthorizationRequestStatus } from '@prisma/client/armory'
import { z } from 'zod'
import { Fixture } from 'zod-fixture'
import { Approval, AuthorizationRequest, SignTransaction } from '../../orchestration/core/type/domain.type'
import { readRequestSchema } from '../../orchestration/persistence/schema/request.schema'
import { readSignTransactionSchema } from '../../orchestration/persistence/schema/sign-transaction.schema'
import { signatureSchema } from '../../orchestration/persistence/schema/signature.schema'
import { readTransactionRequestSchema } from '../../orchestration/persistence/schema/transaction-request.schema'
import { addressGenerator, chainIdGenerator, hexGenerator } from './shared.fixture'

const approvalSchema = signatureSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date()
})

const evaluationSchema = z.object({
  id: z.string().uuid(),
  decision: z.nativeEnum(Decision),
  signature: z.string().nullable(),
  createdAt: z.date()
})

const authorizationRequestSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  status: z.nativeEnum(AuthorizationRequestStatus),
  request: readRequestSchema,
  authentication: signatureSchema,
  approvals: z.array(approvalSchema),
  evaluations: z.array(evaluationSchema),
  idempotencyKey: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const generateTransactionRequest = (partial?: Partial<TransactionRequest>): TransactionRequest => {
  const fixture = new Fixture()
    .extend([hexGenerator, addressGenerator, chainIdGenerator])
    .fromSchema(readTransactionRequestSchema)

  return {
    ...fixture,
    ...partial
  }
}

export const generateSignTransactionRequest = (partial?: Partial<SignTransaction>): SignTransaction => {
  const fixture = new Fixture()
    .extend([hexGenerator, addressGenerator, chainIdGenerator])
    .fromSchema(readSignTransactionSchema)

  return {
    ...fixture,
    ...partial
  }
}

export const generateAuthorizationRequest = (partial?: Partial<AuthorizationRequest>): AuthorizationRequest => {
  const fixture = new Fixture()
    .extend([hexGenerator, addressGenerator, chainIdGenerator])
    .fromSchema(authorizationRequestSchema)

  return {
    ...fixture,
    ...partial
  }
}

export const generateApproval = (partial?: Partial<Approval>): Approval => ({
  ...new Fixture().fromSchema(approvalSchema),
  ...partial
})

export const generateSignature = (partial?: Partial<Signature>): Signature => ({
  ...new Fixture().fromSchema(approvalSchema),
  ...partial
})
