import { ZodSchema } from 'zod'
import { JwtError } from './error'
import { Jwk } from './types'

export function validate<T>({ schema, jwk, errorMessage }: { schema: ZodSchema<T>; jwk: Jwk; errorMessage?: string }) {
  return (function validate(input: Jwk): T {
    const result = schema.safeParse(input)
    if (!result.success) {
      if (errorMessage === 'Invalid public key') {
        console.log('### result', result.error)
        console.log('### result.error', result.error)
        console.log('### publicKey', JSON.stringify(input, null, 2))
      }
      throw new JwtError({
        message: errorMessage || 'Invalid JWK',
        context: { errors: result.error }
      })
    }
    return result.data
  })(jwk)
}
