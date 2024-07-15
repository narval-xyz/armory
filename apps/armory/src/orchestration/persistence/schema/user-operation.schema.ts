import { addressSchema, hexSchema } from '@narval/policy-engine-shared'
import { z } from 'zod'

export const readUserOperationSchema = z.object({
  sender: addressSchema,
  nonce: z.coerce.number(),
  initCode: hexSchema,
  callData: hexSchema,
  callGasLimit: z.coerce.number(),
  verificationGasLimit: z.coerce.number(),
  preVerificationGas: z.coerce.number(),
  maxFeePerGas: z.coerce.number(),
  maxPriorityFeePerGas: z.coerce.number(),
  paymasterAndData: hexSchema,
  entryPoint: addressSchema,
  signature: hexSchema,
  factoryAddress: addressSchema,
  chainId: z.coerce.number()
})

export const createUserOperationSchema = readUserOperationSchema
