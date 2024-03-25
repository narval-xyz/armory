import { p256 } from '@noble/curves/p256'
import { secp256k1 } from '@noble/curves/secp256k1'
import { sha256 as sha256Hash } from '@noble/hashes/sha256'
import { exportJWK, generateKeyPair } from 'jose'
import { toHex } from 'viem'
import { publicKeyToAddress } from 'viem/utils'
import { JwtError } from './error'
import { rsaPrivateKeySchema } from './schemas'
import {
  Alg,
  Curves,
  Hex,
  Jwk,
  KeyTypes,
  P256PrivateKey,
  P256PublicKey,
  RsaPrivateKey,
  Secp256k1KeySchema,
  Secp256k1PrivateKey,
  Secp256k1PublicKey,
  Use
} from './types'
import { validate } from './validate'

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

export const addressToKid = (address: string): string => {
  return toHex(sha256Hash(address.toLowerCase()))
}

// ES256k
export const secp256k1PublicKeyToJwk = (publicKey: Hex, keyId?: string): Secp256k1PublicKey => {
  // remove the 0x04 prefix -- 04 means it's an uncompressed ECDSA key, 02 or 03 means compressed -- these need to be removed in a JWK!
  const hexPubKey = publicKey.slice(4)
  const x = hexPubKey.slice(0, 64)
  const y = hexPubKey.slice(64)
  return {
    kty: KeyTypes.EC,
    crv: Curves.SECP256K1,
    alg: Alg.ES256K,
    // use: Use.SIG,
    kid: keyId || addressToKid(publicKeyToAddress(publicKey)), // add an opaque prefix that indicates the key type
    x: hexToBase64Url(`0x${x}`),
    y: hexToBase64Url(`0x${y}`)
  }
}

export const p256PublicKeyToJwk = (publicKey: Hex, keyId?: string): P256PublicKey => {
  const hexPubKey = publicKey.slice(4)
  const x = hexPubKey.slice(0, 64)
  const y = hexPubKey.slice(64)
  return {
    kty: KeyTypes.EC,
    crv: Curves.P256,
    alg: Alg.ES256,
    kid: keyId || publicKeyToAddress(publicKey),
    x: hexToBase64Url(`0x${x}`),
    y: hexToBase64Url(`0x${y}`)
  }
}

// ES256k
export const secp256k1PrivateKeyToJwk = (privateKey: Hex, keyId?: string): Secp256k1PrivateKey => {
  const publicKey = toHex(secp256k1.getPublicKey(privateKey.slice(2), false))
  const publicJwk = secp256k1PublicKeyToJwk(publicKey, keyId)
  return {
    ...publicJwk,
    d: hexToBase64Url(privateKey)
  }
}

export const p256PrivateKeyToJwk = (privateKey: Hex, keyId?: string): P256PrivateKey => {
  const publicKey = toHex(p256.getPublicKey(privateKey.slice(2), false))
  const publicJwk = p256PublicKeyToJwk(publicKey, keyId)
  return {
    ...publicJwk,
    d: hexToBase64Url(privateKey)
  }
}

export const p256PrivateKeyToHex = (jwk: P256PrivateKey): Hex => {
  return base64UrlToHex(jwk.d)
}

export const secp256k1PublicKeyToHex = (jwk: Secp256k1KeySchema): Hex => {
  const x = base64UrlToHex(jwk.x)
  const y = base64UrlToHex(jwk.y)
  return `0x04${x.slice(2)}${y.slice(2)}`
}

export const secp256k1PrivateKeyToHex = (jwk: Secp256k1PrivateKey): Hex => {
  return base64UrlToHex(jwk.d)
}

export function base64ToBase64Url(base64: string): string {
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export function base64UrlToBase64(base64Url: string): string {
  return base64Url.replace(/-/g, '+').replace(/_/g, '/')
}

export const hexToBase64Url = (hex: Hex): string => {
  const base64Signature = Buffer.from(hex.slice(2), 'hex').toString('base64')

  return base64ToBase64Url(base64Signature)
}

export const base64UrlToHex = (base64Url: string): Hex => {
  const base64Signature = base64UrlToBase64(base64Url)
  return `0x${Buffer.from(base64Signature, 'base64').toString('hex')}`
}

export const base64UrlToBytes = (base64Url: string): Buffer => {
  return Buffer.from(base64UrlToBase64(base64Url), 'base64')
}

const rsaKeyToKid = (jwk: Jwk) => {
  // Concatenate the 'n' and 'e' values, splitted by ':'
  const dataToHash = `${jwk.n}:${jwk.e}`

  const binaryData = base64UrlToBytes(dataToHash)
  const hash = sha256Hash(binaryData)
  return toHex(hash)
}

const generateRsaKeyPair = async (
  opts: {
    keyId?: string
    modulusLength?: number
    use?: Use
  } = {
    modulusLength: 2048
  }
): Promise<RsaPrivateKey> => {
  const { privateKey } = await generateKeyPair(Alg.RS256, {
    modulusLength: opts.modulusLength,
    extractable: true
  })

  const partialJwk = await exportJWK(privateKey)
  if (!partialJwk.n) {
    throw new JwtError({ message: 'Invalid JWK; missing n', context: { partialJwk } })
  }
  const jwk: Jwk = {
    ...partialJwk,
    alg: Alg.RS256,
    kty: KeyTypes.RSA,
    crv: undefined,
    use: opts.use || undefined
  }
  jwk.kid = opts.keyId || rsaKeyToKid(jwk)

  const pk = validate<RsaPrivateKey>(rsaPrivateKeySchema, jwk, 'Invalid RSA Private Key JWK')
  return pk
}

export const generateJwk = async (
  alg: Alg,
  opts?: {
    keyId?: string
    modulusLength?: number
    use?: Use
  }
): Promise<Jwk> => {
  switch (alg) {
    case Alg.ES256K: {
      const privateKeyK1 = toHex(secp256k1.utils.randomPrivateKey())
      return secp256k1PrivateKeyToJwk(privateKeyK1, opts?.keyId)
    }
    case Alg.ES256: {
      const privateKeyP256 = toHex(p256.utils.randomPrivateKey())
      return p256PrivateKeyToJwk(privateKeyP256, opts?.keyId)
    }
    case Alg.RS256: {
      const jwk = await generateRsaKeyPair(opts)
      return jwk
    }
    default:
      throw new Error(`Unsupported algorithm: ${alg}`)
  }
}
