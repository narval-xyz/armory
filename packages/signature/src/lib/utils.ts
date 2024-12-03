import { p256 } from '@noble/curves/p256'
import { secp256k1 } from '@noble/curves/secp256k1'
import * as ed25519 from '@noble/ed25519'
import { sha256 as sha256Hash } from '@noble/hashes/sha256'
import { sha512 } from '@noble/hashes/sha512'
import { subtle } from 'crypto'
import { exportJWK, generateKeyPair } from 'jose'
import { cloneDeep, omit } from 'lodash'
import { toHex } from 'viem'
import { publicKeyToAddress } from 'viem/utils'
import { JwtError } from './error'
import {
  ed25519KeySchema,
  ed25519PrivateKeySchema,
  ellipticKeySchema,
  privateKeySchema,
  rsaPrivateKeySchema,
  rsaPublicKeySchema
} from './schemas'
import {
  Alg,
  Curves,
  Ed25519Key,
  Ed25519PrivateKey,
  Ed25519PublicKey,
  EllipticKey,
  Hex,
  Jwk,
  KeyTypes,
  P256PrivateKey,
  P256PublicKey,
  PrivateKey,
  PublicKey,
  RsaPrivateKey,
  RsaPublicKey,
  Secp256k1PrivateKey,
  Secp256k1PublicKey,
  Use,
  publicKeySchema
} from './types'
import { validateJwk } from './validate'

ed25519.utils.sha512Sync = (...m) => sha512(ed25519.utils.concatBytes(...m))

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
    case Alg.EDDSA:
      return {
        kty: KeyTypes.OKP,
        crv: Curves.ED25519,
        alg: Alg.EDDSA
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
export const secp256k1PrivateKeyToJwk = (privateKey: Hex, keyId?: string): Secp256k1PrivateKey | P256PrivateKey => {
  const publicKey = toHex(secp256k1.getPublicKey(privateKey.slice(2), false))
  const publicJwk = secp256k1PublicKeyToJwk(publicKey, keyId)
  return {
    ...publicJwk,
    d: hexToBase64Url(privateKey)
  }
}

export const ed25519PublicKeyToJwk = (publicKey: Hex, keyId?: string): Ed25519PublicKey => {
  // Remove 0x prefix if present
  const hexPubKey = publicKey.slice(2)
  return {
    kty: KeyTypes.OKP,
    crv: Curves.ED25519,
    alg: Alg.EDDSA,
    kid: keyId || addressToKid(publicKey),
    x: hexToBase64Url(`0x${hexPubKey}`)
  }
}

export const ed25519PrivateKeyToJwk = (privateKey: Hex, keyId?: string): Ed25519PrivateKey => {
  const publicKey = toHex(ed25519.sync.getPublicKey(privateKey.slice(2)))

  const publicJwk = ed25519PublicKeyToJwk(publicKey, keyId)
  return {
    ...publicJwk,
    d: hexToBase64Url(privateKey)
  }
}

export const ed25519PrivateKeyToPublicJwk = (privateKey: Hex, keyId?: string): Ed25519PublicKey => {
  const publicKey = toHex(ed25519.sync.getPublicKey(privateKey.slice(2)))
  return ed25519PublicKeyToJwk(publicKey, keyId)
}

export const secp256k1PrivateKeyToPublicJwk = (privateKey: Hex, keyId?: string): Secp256k1PublicKey => {
  const publicKey = toHex(secp256k1.getPublicKey(privateKey.slice(2), false))
  return secp256k1PublicKeyToJwk(publicKey, keyId)
}

export const p256PrivateKeyToJwk = (privateKey: Hex, keyId?: string): P256PrivateKey => {
  const publicKey = toHex(p256.getPublicKey(privateKey.slice(2), false))
  const publicJwk = p256PublicKeyToJwk(publicKey, keyId)
  return {
    ...publicJwk,
    d: hexToBase64Url(privateKey)
  }
}

export const ellipticPublicKeyToHex = (jwk: Jwk): Hex => {
  const key = validateJwk<EllipticKey>({
    schema: ellipticKeySchema,
    jwk: jwk,
    errorMessage: 'Invalid Public Key'
  })
  if (key.x && key.y) {
    const x = base64UrlToHex(key.x)
    const y = base64UrlToHex(key.y)
    return `0x04${x.slice(2)}${y.slice(2)}`
  }

  if (!('d' in key)) {
    throw new JwtError({
      message: 'Invalid JWK: missing x, y, or d',
      context: { jwk: key }
    })
  }

  const publicKeyUncompressed = secp256k1.getPublicKey(key.d, false)
  const publicKeyHex = toHex(publicKeyUncompressed)
  const x = publicKeyHex.substring(2, 66) // Get x part
  const y = publicKeyHex.substring(66) // Get y part
  return `0x04${x.slice(2)}${y.slice(2)}`
}

export const publicKeyToJwk = (key: Hex, alg: Alg, keyId?: string): PublicKey => {
  switch (alg) {
    case Alg.ES256K:
      return secp256k1PublicKeyToJwk(key, keyId)
    case Alg.ES256:
      return p256PublicKeyToJwk(key, keyId)
    case Alg.EDDSA:
      return ed25519PublicKeyToJwk(key, keyId)
    case Alg.RS256:
      throw new JwtError({
        message: 'Conversion from Hex to JWK not supported for RSA keys',
        context: { key }
      })
  }
}

export const ellipticPrivateKeyToHex = (jwk: P256PrivateKey | Secp256k1PrivateKey): Hex => {
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

export const stringToBase64Url = (str: string): string => {
  return base64ToBase64Url(Buffer.from(str).toString('base64'))
}

export const rsaKeyToKid = (jwk: Jwk) => {
  // Concatenate the 'n' and 'e' values, splitted by ':'
  const dataToHash = `${jwk.n}:${jwk.e}`

  const binaryData = base64UrlToBytes(dataToHash)
  const hash = sha256Hash(binaryData)
  return toHex(hash)
}

export const rsaPubKeyToHex = async (jwk: Jwk): Promise<Hex> => {
  const key = validateJwk<RsaPublicKey>({
    schema: rsaPublicKeySchema,
    jwk,
    errorMessage: 'Invalid RSA Public Key'
  })

  const imported = await subtle.importKey(
    'jwk',
    key,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    true,
    ['verify']
  )

  const keyData = await subtle.exportKey('spki', imported)

  return toHex(new Uint8Array(keyData))
}

export const rsaPrivateKeyToHex = async (jwk: Jwk): Promise<Hex> => {
  const key = validateJwk<RsaPrivateKey>({
    schema: rsaPrivateKeySchema,
    jwk,
    errorMessage: 'Invalid RSA Private Key'
  })

  const imported = await subtle.importKey(
    'jwk',
    key,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    true,
    ['sign']
  )

  const keyData = await subtle.exportKey('pkcs8', imported)

  return toHex(new Uint8Array(keyData))
}

export const ed25519PrivateKeyToHex = (jwk: Jwk): Hex => {
  const key = validateJwk<Ed25519PrivateKey>({
    schema: ed25519PrivateKeySchema,
    jwk,
    errorMessage: 'Invalid Ed25519 Key'
  })

  return base64UrlToHex(key.d)
}

export const ed25519PublicKeyToHex = (jwk: Jwk): Hex => {
  const key = validateJwk<Ed25519Key>({
    schema: ed25519KeySchema,
    jwk,
    errorMessage: 'Invalid Ed25519 Key'
  })

  // Case 1: We have the public key directly
  if (key.x) {
    const hex = base64UrlToHex(key.x)
    return hex
  }

  // Case 2: We have a private key, derive public key
  if ('d' in key) {
    const privateKeyHex = base64UrlToHex(key.d)
    const publicKey = ed25519.sync.getPublicKey(privateKeyHex.slice(2))
    const hex = toHex(publicKey)
    return hex
  }

  throw new JwtError({
    message: 'Invalid JWK: missing both x and d',
    context: { jwk: key }
  })
}

export const publicKeyToHex = async (jwk: Jwk): Promise<Hex> => {
  const key = validateJwk<PublicKey>({
    schema: publicKeySchema,
    jwk,
    errorMessage: 'Invalid Public Key'
  })
  switch (key.kty) {
    case KeyTypes.EC:
      return ellipticPublicKeyToHex(jwk)
    case KeyTypes.RSA:
      return rsaPubKeyToHex(jwk)
    case KeyTypes.OKP:
      return ed25519PublicKeyToHex(jwk)
  }
}

export const privateKeyToHex = async (jwk: Jwk): Promise<Hex> => {
  const key = validateJwk<PrivateKey>({
    schema: privateKeySchema,
    jwk,
    errorMessage: 'Invalid Private Key'
  })
  switch (key.kty) {
    case KeyTypes.EC:
      return ellipticPrivateKeyToHex(jwk as P256PrivateKey | Secp256k1PrivateKey)
    case KeyTypes.RSA:
      return rsaPrivateKeyToHex(jwk)
    case KeyTypes.OKP:
      return ed25519PrivateKeyToHex(jwk)
  }
}

export const privateKeyToJwk = (key: Hex, alg: Alg = Alg.ES256K, keyId?: string): PrivateKey => {
  switch (alg) {
    case Alg.ES256K:
      return secp256k1PrivateKeyToJwk(key, keyId)
    case Alg.ES256:
      return p256PrivateKeyToJwk(key, keyId)
    case Alg.EDDSA:
      return ed25519PrivateKeyToJwk(key, keyId)
    case Alg.RS256:
      throw new JwtError({
        message: 'Conversion from Hex to JWK not supported for RSA keys'
      })
  }
}

const generateRsaPrivateKey = async (
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

  const pk = validateJwk<RsaPrivateKey>({
    schema: rsaPrivateKeySchema,
    jwk,
    errorMessage: 'Invalid RSA Private Key'
  })
  return pk
}

export const rsaPrivateKeyToPublicKey = (jwk: RsaPrivateKey) => {
  const publicKey: RsaPublicKey = rsaPublicKeySchema.parse(jwk)
  return publicKey
}

export const generateJwk = async <T = Jwk>(
  alg: Alg,
  opts?: {
    keyId?: string
    modulusLength?: number
    use?: Use
  }
): Promise<T> => {
  switch (alg) {
    case Alg.ES256K: {
      const privateKeyK1 = toHex(secp256k1.utils.randomPrivateKey())
      return secp256k1PrivateKeyToJwk(privateKeyK1, opts?.keyId) as T
    }
    case Alg.ES256: {
      const privateKeyP256 = toHex(p256.utils.randomPrivateKey())
      return p256PrivateKeyToJwk(privateKeyP256, opts?.keyId) as T
    }
    case Alg.RS256: {
      const jwk = await generateRsaPrivateKey(opts)
      return jwk as T
    }
    case Alg.EDDSA: {
      const privateKeyEd25519 = toHex(ed25519.utils.randomPrivateKey())
      return ed25519PrivateKeyToJwk(privateKeyEd25519, opts?.keyId) as T
    }
    default:
      throw new Error(`Unsupported algorithm: ${alg}`)
  }
}

export const nowSeconds = (): number => Math.floor(Date.now() / 1000)

export const getPublicKey = (key: Jwk): PublicKey => publicKeySchema.parse(key)

export const requestWithoutWildcardFields = (
  request: object,
  wildcardPaths: string[] = [],
  allowedPaths: string[] = []
): object => {
  const validPaths = wildcardPaths.filter((path) => allowedPaths.includes(path))
  return omit(cloneDeep(request), validPaths)
}

export const ed25519polyfilled = ed25519
