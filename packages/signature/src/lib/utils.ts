import { secp256k1 } from '@noble/curves/secp256k1'
import { toHex } from 'viem'
import { publicKeyToAddress } from 'viem/utils'
import { Alg, Curves, Hex, JWK, KeyTypes, Use } from './types'

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
        kty: KeyTypes.EC,
        crv: Curves.SECP256K1,
        alg: Alg.ES256K
      }
    case Alg.ES256:
      return {
        kty: KeyTypes.EC,
        crv: Curves.P256,
        alg: Alg.ES256
      }
    case Alg.RS256:
      return {
        kty: KeyTypes.RSA,
        alg: Alg.RS256
      }
    default:
      throw new Error(`Unsupported algorithm: ${alg}`)
  }
}

// ES256k
export const publicKeyToJwk = (publicKey: Hex, keyId?: string): JWK => {
  return {
    kty: KeyTypes.EC,
    crv: Curves.SECP256K1,
    alg: Alg.ES256K,
    use: Use.SIG,
    kid: keyId || publicKeyToAddress(publicKey), // add an opaque prefix that indicates the key type
    x: publicKey.slice(2, 66),
    y: publicKey.slice(66)
  }
}

// ES256k
export const privateKeyToJwk = (privateKey: Hex, keyId?: string): JWK => {
  const publicKey = toHex(secp256k1.getPublicKey(privateKey.slice(2), false))
  const publicJwk = publicKeyToJwk(publicKey, keyId)
  return {
    ...publicJwk,
    d: privateKey.slice(2)
  }
}

export function base64ToBase64Url(base64: string): string {
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export const hexToBase64Url = (hex: Hex): string => {
  const base64Signature = Buffer.from(hex.slice(2), 'hex').toString('base64')

  return base64ToBase64Url(base64Signature)
}
