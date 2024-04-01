import { ZodSchema } from 'zod'
import { JwtError } from './error'
import { Jwk } from './types'

export function buildValidator<T>({ schema, errorMessage }: { schema: ZodSchema<T>; errorMessage?: string }) {
  return (jwk: Jwk): T => {
    const result = schema.safeParse(jwk)
    if (!result.success) {
      throw new JwtError({
        message: errorMessage || 'Invalid JWK',
        context: { errors: result.error }
      })
    }
    return result.data
  }
}

export function validate<T>({ schema, jwk, errorMessage }: { schema: ZodSchema<T>; jwk: Jwk; errorMessage?: string }) {
  return buildValidator({ schema, errorMessage })(jwk)
}
