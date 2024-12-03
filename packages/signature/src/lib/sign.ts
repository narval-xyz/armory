import { p256 } from '@noble/curves/p256'
import { secp256k1 } from '@noble/curves/secp256k1'
import { sha256 as sha256Hash } from '@noble/hashes/sha256'
import { keccak_256 as keccak256 } from '@noble/hashes/sha3'
import { subtle } from 'crypto'
import { hexToBigInt, isHex, toBytes, toHex } from 'viem'
import { JwtError } from './error'
import { hash } from './hash'
import { canonicalize } from './json.util'
import { jwkBaseSchema, privateKeySchema } from './schemas'
import { Alg, EcdsaSignature, Header, Hex, Jwk, JwsdHeader, PartialJwk, Payload, PrivateKey, SigningAlg } from './types'
import { ed25519polyfilled as ed25519, hexToBase64Url, privateKeyToHex, stringToBase64Url } from './utils'
import { validateJwk } from './validate'

const SigningAlgToKey = {
  [SigningAlg.EIP191]: Alg.ES256K,
  [SigningAlg.ES256K]: Alg.ES256K,
  [SigningAlg.ES256]: Alg.ES256,
  [SigningAlg.RS256]: Alg.RS256,
  [SigningAlg.ED25519]: Alg.EDDSA
}

const buildHeader = (jwk: Jwk, alg?: SigningAlg): Header => {
  const key = validateJwk<PartialJwk>({
    schema: jwkBaseSchema,
    jwk,
    errorMessage: 'Invalid JWK: failed to validate basic fields'
  })
  // Validate that the alg & the key alg are compatible
  const headerAlg = alg || key.alg
  const validKeyAlg = SigningAlgToKey[headerAlg]
  if (key.alg !== validKeyAlg) {
    throw new JwtError({
      message: 'Mismatch between jwk & signing alg',
      context: {
        jwkAlg: key.alg,
        signingAlg: headerAlg
      }
    })
  }
  return {
    alg: alg || key.alg,
    kid: key.kid,
    typ: 'JWT'
  }
}

export async function signJwsd(
  rawBody: string | object,
  header: JwsdHeader,
  signer: (payload: string) => Promise<string>
): Promise<string> {
  const encodedHeader = stringToBase64Url(canonicalize(header))
  const encodedPayload = hexToBase64Url(hash(rawBody))

  const messageToSign = `${encodedHeader}.${encodedPayload}`

  const signature = await signer(messageToSign)

  const completeJWT = `${messageToSign}.${signature}`
  return completeJWT
}

/**
 * Sign using a custom signer. It means signer may be responsible of getting key private material.
 * MetaMask wallets signing / MPC signing services are examples of this.
 * @param payload
 * @param jwk
 * @param opts
 * @param signer
 * @returns
 */
export async function signJwt(
  payload: Payload,
  jwk: Jwk,
  opts: { alg?: SigningAlg },
  signer: (payload: string) => Promise<string>
): Promise<string>

/**
 * Signs using default signers per algorithm. Key private material is required.
 * @param payload
 * @param jwk
 * @param opts
 * @returns
 */
export async function signJwt(payload: Payload, jwk: Jwk, opts: { alg?: SigningAlg }): Promise<string>

/**
 * Signs using default signers per algorithm. Key private material is required.
 * opts are not provided
 * @param payload
 * @param jwk
 * @returns
 */
export async function signJwt(payload: Payload, jwk: Jwk): Promise<string>

export async function signJwt(
  payload: Payload,
  jwk: Jwk,
  optsOrSigner?: { alg?: SigningAlg } | ((payload: string) => Promise<string>),
  signer?: (payload: string) => Promise<string>
): Promise<string> {
  let opts: { alg?: SigningAlg } = {}
  let actualSigner: ((payload: string) => Promise<string>) | undefined = undefined

  if (typeof optsOrSigner === 'function') {
    actualSigner = optsOrSigner
  } else {
    opts = optsOrSigner || {}
    actualSigner = signer
  }

  const header = buildHeader(jwk, opts.alg)
  const encodedHeader = stringToBase64Url(canonicalize(header))
  const encodedPayload = stringToBase64Url(canonicalize(payload))
  const messageToSign = `${encodedHeader}.${encodedPayload}`
  // Determine the signing logic based on the presence of a custom signer
  let signature: string
  if (actualSigner) {
    signature = await actualSigner(messageToSign)
  } else {
    // Default signer logic
    // Validate JWK as a private key for default signing
    const privateKey = validateJwk<PrivateKey>({
      schema: privateKeySchema,
      jwk,
      errorMessage: 'Invalid JWK: failed to validate private key'
    })
    const privateKeyHex = await privateKeyToHex(privateKey)
    switch (header.alg) {
      case SigningAlg.ES256K:
        signature = await buildSignerEs256k(privateKeyHex)(messageToSign)
        break
      case SigningAlg.EIP191:
        signature = await buildSignerEip191(privateKeyHex)(messageToSign)
        break
      case SigningAlg.ES256:
        signature = await buildSignerEs256(privateKeyHex)(messageToSign)
        break
      case SigningAlg.RS256:
        signature = await buildSignerRs256(jwk)(messageToSign)
        break
      case SigningAlg.ED25519:
        signature = await buildSignerEdDSA(privateKeyHex)(messageToSign)
        break
      default: {
        throw new JwtError({
          message: 'Unsupported signing algorithm',
          context: { alg: header.alg }
        })
      }
    }
  }

  return `${messageToSign}.${signature}`
}

export const signSecp256k1 = (hash: Uint8Array, privateKey: Hex | string, isEth?: boolean): EcdsaSignature => {
  const pk = isHex(privateKey) ? privateKey.slice(2) : privateKey
  const { r, s, recovery } = secp256k1.sign(hash, pk)
  const rHex = toHex(r, { size: 32 })
  const sHex = toHex(s, { size: 32 })
  // Ethereum recovery id is 27 or 28 so we need to adjust it
  const recoveryBn = isEth ? 27n + BigInt(recovery) : BigInt(recovery)

  return {
    r: rHex,
    s: sHex,
    v: recoveryBn
  }
}

export const signP256 = (hash: Uint8Array, privateKey: Hex | string): EcdsaSignature => {
  const pk = isHex(privateKey) ? privateKey.slice(2) : privateKey
  const sig = p256.sign(hash, pk)
  const { r, s, recovery } = sig
  const rHex = toHex(r, { size: 32 })
  const sHex = toHex(s, { size: 32 })
  const recoveryBn = BigInt(recovery)

  return {
    r: rHex,
    s: sHex,
    v: recoveryBn
  }
}

export const signatureToHex = (signature: EcdsaSignature): Hex => {
  const { v, r, s } = signature
  return `0x${new secp256k1.Signature(hexToBigInt(r), hexToBigInt(s)).toCompactHex()}${toHex(v).slice(2)}`
}

export const buildSignerEs256k =
  (privateKey: Hex | string) =>
  async (messageToSign: string): Promise<string> => {
    const hash = sha256Hash(messageToSign)

    const signature = signSecp256k1(hash, privateKey)
    const hexSignature = signatureToHex(signature)
    return hexToBase64Url(hexSignature)
  }

// EIP-191 hash - https://eips.ethereum.org/EIPS/eip-191
// keccak256("\x19Ethereum Signed Message:\n" + len(message) + message)
export const eip191Hash = (message: string): Uint8Array => {
  const prefix = '\x19Ethereum Signed Message:\n'
  const messageBytes = toBytes(message)
  const messageLength = messageBytes.length
  const prefixBytes = toBytes(`${prefix}${messageLength}`)
  const combinedBytes = new Uint8Array([...prefixBytes, ...messageBytes])
  const hash = keccak256(combinedBytes)
  return hash
}

export const buildSignerEip191 =
  (privateKey: Hex | string) =>
  async (messageToSign: string): Promise<string> => {
    const hash = eip191Hash(messageToSign)
    const signature = signSecp256k1(hash, privateKey, true)
    const hexSignature = signatureToHex(signature)
    return hexToBase64Url(hexSignature)
  }

export const signEd25519 = async (message: Uint8Array, privateKey: Hex | string): Promise<Uint8Array> => {
  const pk = isHex(privateKey) ? privateKey.slice(2) : privateKey
  const signature = await ed25519.sign(message, pk)

  return signature
}

export const buildSignerEdDSA =
  (privateKey: Hex | string) =>
  async (messageToSign: string): Promise<string> => {
    const signature = await signEd25519(toBytes(messageToSign), privateKey)
    return hexToBase64Url(toHex(signature))
  }

export const buildSignerEs256 =
  (privateKey: Hex | string) =>
  async (messageToSign: string): Promise<string> => {
    const hash = sha256Hash(messageToSign)

    const signature = signP256(hash, privateKey)

    const hexSignature = signatureToHex(signature)
    return hexToBase64Url(hexSignature)
  }

export const buildSignerRs256 =
  (jwk: Jwk) =>
  async (messageToSign: string): Promise<string> => {
    const key = await subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      false,
      ['sign']
    )

    const signature = await subtle.sign('RSASSA-PKCS1-v1_5', key, Buffer.from(messageToSign))

    const hexSignature = toHex(new Uint8Array(signature))
    return hexToBase64Url(hexSignature)
  }

export const buildSignerForAlg = async (jwk: Jwk) => {
  // Default signer logic
  // Validate JWK as a private key for default signing
  const privateKey = validateJwk<PrivateKey>({
    schema: privateKeySchema,
    jwk,
    errorMessage: 'Invalid JWK: failed to validate private key'
  })
  const { alg } = jwk
  switch (alg) {
    case SigningAlg.ES256K: {
      const privateKeyHex = await privateKeyToHex(privateKey)
      return buildSignerEs256k(privateKeyHex)
    }
    case SigningAlg.ES256: {
      const privateKeyHex = await privateKeyToHex(privateKey)
      return buildSignerEs256(privateKeyHex)
    }
    case SigningAlg.RS256:
      return buildSignerRs256(privateKey)
    default:
      throw new JwtError({
        message: 'Unsupported signing algorithm',
        context: { alg }
      })
  }
}
