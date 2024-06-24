import { SigningAlg, jwkSchema } from '@narval/signature'
import { z } from 'zod'

export const Signer = z.object({
  jwk: jwkSchema,
  alg: z.nativeEnum(SigningAlg),
  sign: z.function(z.tuple([z.string()]), z.promise(z.string()))
})
export type Signer = z.infer<typeof Signer>

export type SignOptions = {
  issuedAt?: Date
}
