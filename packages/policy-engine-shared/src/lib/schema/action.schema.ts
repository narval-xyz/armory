import { z } from 'zod'
import { Action } from '../type/action.type'
import { addressSchema } from './address.schema'
import { hexSchema } from './hex.schema'

export const AccessListSchema = z.array(
  z.object({
    address: addressSchema,
    storageKeys: z.array(hexSchema)
  })
)
// export type AccessList = z.infer<typeof AccessList>

export const ActionSchema = z.nativeEnum(Action)

export const BaseActionSchema = z.object({
  action: ActionSchema,
  nonce: z.string()
})
// export type BaseActionSchema = z.infer<typeof BaseActionSchema>

export const TransactionRequestSchema = z.object({
  chainId: z.number(),
  from: addressSchema,
  nonce: z.number().optional(),
  accessList: AccessListSchema.optional(),
  data: hexSchema.optional(),
  gas: z.coerce.bigint().optional(),
  maxFeePerGas: z.coerce.bigint().optional(),
  maxPriorityFeePerGas: z.coerce.bigint().optional(),
  to: addressSchema.nullable().optional(),
  type: z.literal('2').optional(),
  value: hexSchema.optional()
})
// export type TransactionRequest = z.infer<typeof TransactionRequest>

export const SignTransactionActionSchema = z.intersection(
  BaseActionSchema,
  z.object({
    action: z.literal(Action.SIGN_TRANSACTION),
    resourceId: z.string(),
    transactionRequest: TransactionRequestSchema
  })
)
// export type SignTransactionAction = z.infer<typeof SignTransactionAction>

// Matching viem's SignableMessage options https://viem.sh/docs/actions/wallet/signMessage#message
export const SignableMessageSchema = z.union([
  z.string(),
  z.object({
    raw: hexSchema
  })
])
// export type SignableMessage = z.infer<typeof SignableMessage>

export const SignMessageActionSchema = z.intersection(
  BaseActionSchema,
  z.object({
    action: z.literal(Action.SIGN_MESSAGE),
    resourceId: z.string(),
    message: SignableMessageSchema
  })
)
// export type SignMessageAction = z.infer<typeof SignMessageAction>

export const SignTypedDataActionSchema = z.intersection(
  BaseActionSchema,
  z.object({
    action: z.literal(Action.SIGN_TYPED_DATA),
    resourceId: z.string(),
    typedData: z.string()
  })
)
// export type SignTypedDataAction = z.infer<typeof SignTypedDataAction>
