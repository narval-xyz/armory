import { fromHex } from 'viem'
import { z } from 'zod'
import { addressSchema } from '../schema/address.schema'
import { hexSchema } from '../schema/hex.schema'
import { isHexString } from '../util/typeguards'

export const Action = {
  SIGN_TRANSACTION: 'signTransaction',
  SIGN_RAW: 'signRaw',
  SIGN_MESSAGE: 'signMessage',
  SIGN_TYPED_DATA: 'signTypedData'
} as const
export type Action = (typeof Action)[keyof typeof Action]
export const ActionSchema = z.nativeEnum(Action)

export const AccessList = z.array(
  z.object({
    address: addressSchema,
    storageKeys: z.array(hexSchema)
  })
)
export type AccessList = z.infer<typeof AccessList>

export const BaseAction = z.object({
  action: ActionSchema,
  nonce: z.string()
})
export type BaseAction = z.infer<typeof BaseAction>

export const TransactionRequest = z.object({
  chainId: z.number(),
  from: addressSchema,
  nonce: z.number().optional(),
  accessList: AccessList.optional(),
  data: hexSchema.optional(),
  gas: z.coerce.bigint().optional(),
  maxFeePerGas: z.coerce.bigint().optional(),
  maxPriorityFeePerGas: z.coerce.bigint().optional(),
  to: addressSchema.nullable().optional(),
  type: z.literal('2').optional(),
  value: hexSchema.optional()
})
export type TransactionRequest = z.infer<typeof TransactionRequest>

export const SerializedTransactionRequest = TransactionRequest.extend({
  gas: z.coerce.string().optional(),
  maxFeePerGas: z.coerce.string().optional(),
  maxPriorityFeePerGas: z.coerce.string().optional()
})
export type SerializedTransactionRequest = z.infer<typeof SerializedTransactionRequest>

export const Eip712Domain = z.object({
  name: z.string().optional(),
  version: z.string().optional(),
  chainId: z.number().optional(),
  verifyingContract: addressSchema.optional(),
  salt: hexSchema.optional()
})
export type Eip712Domain = z.infer<typeof Eip712Domain>

export const Eip712TypedData = z.object({
  domain: Eip712Domain,
  types: z.record(
    z.array(
      z.object({
        name: z.string(),
        // TODO: make this more specific to the solidity types allowed
        type: z.string()
      })
    )
  ),
  primaryType: z.string(),
  message: z.record(z.unknown())
})
export type Eip712TypedData = z.infer<typeof Eip712TypedData>

export const SignTransactionAction = BaseAction.merge(
  z.object({
    action: z.literal(Action.SIGN_TRANSACTION),
    resourceId: z.string(),
    transactionRequest: TransactionRequest
  })
)
export type SignTransactionAction = z.infer<typeof SignTransactionAction>

// Matching viem's SignableMessage options
// See https://viem.sh/docs/actions/wallet/signMessage#message
export const SignableMessage = z.union([
  z.string(),
  z.object({
    raw: hexSchema
  })
])
export type SignableMessage = z.infer<typeof SignableMessage>

export const SignMessageAction = BaseAction.merge(
  z.object({
    action: z.literal(Action.SIGN_MESSAGE),
    resourceId: z.string(),
    message: SignableMessage
  })
)
export type SignMessageAction = z.infer<typeof SignMessageAction>

export const SignTypedDataAction = BaseAction.merge(
  z.object({
    action: z.literal(Action.SIGN_TYPED_DATA),
    resourceId: z.string(),
    // Accept typedData as a JSON object, or a stringified JSON, or a
    // hex-encoded stringified JSON.
    typedData: z.preprocess((val) => {
      if (typeof val === 'string') {
        try {
          const decoded = isHexString(val) ? fromHex(val, 'string') : val
          return JSON.parse(decoded)
        } catch (error) {
          return val
        }
      }
      return val
    }, Eip712TypedData)
  })
)
export type SignTypedDataAction = z.infer<typeof SignTypedDataAction>

export const SignRawAction = BaseAction.merge(
  z.object({
    action: z.literal(Action.SIGN_RAW),
    resourceId: z.string(),
    rawMessage: hexSchema
  })
)
export type SignRawAction = z.infer<typeof SignRawAction>
