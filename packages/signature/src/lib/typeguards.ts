import { jwkEoaSchema, jwkSchema, secp256k1PublicKeySchema } from './schemas'
import { EoaPublicKey, Header, Jwk, Secp256k1PublicKey, SigningAlg } from './types'

function isAlg(alg: unknown): alg is SigningAlg {
  return typeof alg === 'string' && Object.values(SigningAlg).includes(alg as SigningAlg)
}

function isStringNonNull(kid: unknown): kid is string {
  return typeof kid === 'string' && kid.length > 0
}

export function isJwk(jwk: unknown): jwk is Jwk {
  return jwkSchema.safeParse(jwk).success
}

export const isSepc256k1PublicKeyJwk = (jwk: Jwk): jwk is Secp256k1PublicKey =>
  secp256k1PublicKeySchema.safeParse(jwk).success
export const isEoaPublicKeyJwk = (jwk: Jwk): jwk is EoaPublicKey => jwkEoaSchema.safeParse(jwk).success

export function isHeader(header: unknown): header is Header {
  return (
    typeof header === 'object' &&
    header !== null &&
    'alg' in header &&
    'kid' in header &&
    isAlg(header.alg) &&
    isStringNonNull(header.kid)
  )
}
