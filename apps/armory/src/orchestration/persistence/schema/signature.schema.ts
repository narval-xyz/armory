import { Alg } from '@narval/policy-engine-shared'
import { z } from 'zod'

export const algSchema = z.nativeEnum(Alg)

export const signatureSchema = z.object({
  sig: z.string(),
  alg: algSchema,
  pubKey: z.string()
})
