import { Alg, AlgTypes, Curves } from './types'

export const algToJwk = (
  alg: Alg
): {
  kty: string
  crv?: string
  alg: string
} => {
  switch (alg) {
    case Alg.ES256K:
      return {
        kty: AlgTypes.EC,
        crv: Curves.SECP256K1,
        alg: Alg.ES256K
      }
    case Alg.ES256:
      return {
        kty: AlgTypes.EC,
        crv: Curves.P256,
        alg: Alg.ES256
      }
    case Alg.RS256:
      return {
        kty: AlgTypes.RSA,
        alg: Alg.RS256
      }
    default:
      throw new Error(`Unsupported algorithm: ${alg}`)
  }
}
