import { Approval, AuthorizationRequest, SignTransaction } from '@app/orchestration/policy-engine/core/type/domain.type'
import { readRequestSchema } from '@app/orchestration/policy-engine/persistence/schema/request.schema'
import { readSignTransactionSchema } from '@app/orchestration/policy-engine/persistence/schema/sign-transaction.schema'
import { signatureSchema } from '@app/orchestration/policy-engine/persistence/schema/signature.schema'
import {
  addressSchema,
  hexSchema
} from '@app/orchestration/policy-engine/persistence/schema/transaction-request.schema'
import { faker } from '@faker-js/faker'
import { Decision, Signature } from '@narval/authz-shared'
import { AuthorizationRequestStatus } from '@prisma/client/orchestration'
import { sample } from 'lodash'
import { z } from 'zod'
import { Fixture, Generator } from 'zod-fixture'

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

const hexGenerator = Generator({
  schema: hexSchema,
  output: () => faker.string.hexadecimal().toLowerCase()
})

const addressGenerator = Generator({
  schema: addressSchema,
  output: () => faker.finance.ethereumAddress().toLowerCase()
})

const chainIdGenerator = Generator({
  schema: z.number().min(1),
  filter: ({ transform, def }) => transform.utils.checks(def.checks).has('chainId'),
  output: () => sample([1, 137])
})

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
