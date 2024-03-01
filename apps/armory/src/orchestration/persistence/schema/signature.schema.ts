import { Alg } from '@narval/signature'
import { z } from 'zod'

export const algSchema = z.nativeEnum(Alg)

export const signatureSchema = z.object({
  sig: z.string(),
  alg: algSchema,
  pubKey: z.string()
})
