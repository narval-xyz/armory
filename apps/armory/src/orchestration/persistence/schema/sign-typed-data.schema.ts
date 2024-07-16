import { Action, Eip712TypedData, SerializedEip712TypedData } from '@narval/policy-engine-shared'
import { z } from 'zod'

export const createSignTypedDataSchema = z.object({
  action: z.literal(Action.SIGN_TYPED_DATA),
  nonce: z.string(),
  resourceId: z.string(),
  typedData: SerializedEip712TypedData
})

export const readSignTypedDataSchema = createSignTypedDataSchema.extend({
  typedData: Eip712TypedData
})
