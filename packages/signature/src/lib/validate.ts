import { ZodSchema } from 'zod'
import { JwtError } from './error'
import { Jwk } from './types'

export function validate<T>({
  schema,
  jwk,
  errorMessage,
}: {
  schema: ZodSchema<T>
  jwk: Jwk
  errorMessage?: string
}) {
  return (function validate(input: Jwk): T {
    const result = schema.safeParse(input)
    if (!result.success) {
      throw new JwtError({
        message: errorMessage || 'Invalid JWK',
        context: { errors: result.error.flatten().fieldErrors }
      })
    }
    return result.data
  })(jwk)
}
