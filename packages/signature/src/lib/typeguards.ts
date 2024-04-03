import { jwkEoaSchema, secp256k1PublicKeySchema } from './schemas'
import { EoaPublicKey, Jwk, Secp256k1PublicKey } from './types'

export const isSecp256k1PublicKeyJwk = (jwk: Jwk): jwk is Secp256k1PublicKey =>
  secp256k1PublicKeySchema.safeParse(jwk).success
export const isEoaPublicKeyJwk = (jwk: Jwk): jwk is EoaPublicKey => jwkEoaSchema.safeParse(jwk).success
