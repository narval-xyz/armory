import { fromHex } from 'viem'
import { z } from 'zod'
import { addressSchema } from '../schema/address.schema'
import { hexSchema } from '../schema/hex.schema'
import { isHexString } from '../util/typeguards'

export const Action = {
  SIGN_TRANSACTION: 'signTransaction',
  SIGN_RAW: 'signRaw',
  SIGN_MESSAGE: 'signMessage',
  SIGN_USER_OPERATION: 'signUserOperation',
  SIGN_TYPED_DATA: 'signTypedData',
  GRANT_PERMISSION: 'grantPermission'
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

export const TransactionRequestEIP1559 = z.object({
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
export type TransactionRequestEIP1559 = z.infer<typeof TransactionRequestEIP1559>

export const SerializedTransactionRequestEIP1559 = TransactionRequestEIP1559.extend({
  gas: z.coerce.string().optional(),
  maxFeePerGas: z.coerce.string().optional(),
  maxPriorityFeePerGas: z.coerce.string().optional()
})
export type SerializedTransactionRequestEIP1559 = z.infer<typeof SerializedTransactionRequestEIP1559>

export const TransactionRequestLegacy = z.object({
  chainId: z.number(),
  from: addressSchema,
  nonce: z.number().optional(),
  data: hexSchema.optional(),
  gas: z.coerce.bigint().optional(),
  gasPrice: z.coerce.bigint().optional(),
  type: z.literal('0').optional(),
  to: addressSchema.nullable().optional(),
  value: hexSchema.optional()
})
export type TransactionRequestLegacy = z.infer<typeof TransactionRequestLegacy>

export const SerializedTransactionRequestLegacy = TransactionRequestLegacy.extend({
  gas: z.coerce.string().optional(),
  gasPrice: z.coerce.string().optional()
})
export type SerializedTransactionRequestLegacy = z.infer<typeof SerializedTransactionRequestLegacy>

export const TransactionRequest = z.union([TransactionRequestEIP1559, TransactionRequestLegacy])
export type TransactionRequest = z.infer<typeof TransactionRequest>

export const SerializedTransactionRequest = z.union([
  SerializedTransactionRequestEIP1559,
  SerializedTransactionRequestLegacy
])
export type SerializedTransactionRequest = z.infer<typeof SerializedTransactionRequest>

export const UserOperationV6 = z.object({
  sender: addressSchema,
  nonce: z.coerce.bigint(),
  initCode: hexSchema,
  callData: hexSchema,
  callGasLimit: z.coerce.bigint(),
  verificationGasLimit: z.coerce.bigint(),
  preVerificationGas: z.coerce.bigint(),
  maxFeePerGas: z.coerce.bigint(),
  maxPriorityFeePerGas: z.coerce.bigint(),
  paymasterAndData: hexSchema,
  entryPoint: addressSchema,
  signature: hexSchema,
  factoryAddress: addressSchema,
  chainId: z.coerce.number()
  // TODO: determine what should be part of the user operation and what is a metadata (chainId, factoryAddress, signature, entrypoint)
})
export type UserOperationV6 = z.infer<typeof UserOperationV6>

export const Eip712Domain = z.object({
  name: z.string().optional(),
  version: z.string().optional(),
  chainId: z.coerce.number().optional(),
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
  message: z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val)
      } catch (error) {
        return val
      }
    }
    return val
  }, z.record(z.unknown()))
})
export type Eip712TypedData = z.infer<typeof Eip712TypedData>

export const SerializedEip712TypedData = Eip712TypedData.transform((val) => {
  return {
    ...val,
    message: JSON.stringify(val.message)
  }
})
export type SerializedEip712TypedData = z.infer<typeof SerializedEip712TypedData>

export const SignTransactionAction = BaseAction.merge(
  z.object({
    action: z.literal(Action.SIGN_TRANSACTION),
    resourceId: z.string(),
    transactionRequest: TransactionRequest
  })
)
export type SignTransactionAction = z.infer<typeof SignTransactionAction>

export const SerializedTransactionAction = SignTransactionAction.extend({
  transactionRequest: SerializedTransactionRequest
})
export type SerializedTransactionAction = z.infer<typeof SerializedTransactionAction>

export const SignUserOperationAction = BaseAction.merge(
  z.object({
    action: z.literal(Action.SIGN_USER_OPERATION),
    resourceId: z.string(),
    userOperation: UserOperationV6
  })
)
export type SignUserOperationAction = z.infer<typeof SignUserOperationAction>

export const SerializedUserOperationV6 = UserOperationV6.extend({
  maxFeePerGas: z.coerce.string(),
  maxPriorityFeePerGas: z.coerce.string(),
  callGasLimit: z.coerce.string(),
  verificationGasLimit: z.coerce.string(),
  preVerificationGas: z.coerce.string(),
  nonce: z.coerce.string()
})
export type SerializedUserOperationV6 = z.infer<typeof SerializedUserOperationV6>

export const SerializedUserOperationAction = SignUserOperationAction.extend({
  userOperation: SerializedUserOperationV6
})
export type SerializedUserOperationAction = z.infer<typeof SerializedUserOperationAction>

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

export const GrantPermissionAction = BaseAction.merge(
  z.object({
    action: z.literal(Action.GRANT_PERMISSION),
    resourceId: z.string(),
    permissions: z.array(z.string())
  })
)
export type GrantPermissionAction = z.infer<typeof GrantPermissionAction>

export const SignableRequest = z.union([
  SignTransactionAction,
  SignMessageAction,
  SignTypedDataAction,
  SignUserOperationAction,
  SignRawAction
])
export type SignableRequest = z.infer<typeof SignableRequest>

export const SerializedSignableRequest = z.union([
  SerializedTransactionAction,
  SignMessageAction,
  SignTypedDataAction,
  SignRawAction,
  SerializedUserOperationAction
])
export type SerializedSignableRequest = z.infer<typeof SerializedSignableRequest>
