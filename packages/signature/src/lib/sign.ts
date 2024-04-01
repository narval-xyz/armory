import { secp256k1 } from '@noble/curves/secp256k1'
import { sha256 as sha256Hash } from '@noble/hashes/sha256'
import { keccak_256 as keccak256 } from '@noble/hashes/sha3'
import { SignJWT, base64url, importJWK } from 'jose'
import { isHex, signatureToHex, toBytes, toHex } from 'viem'
import { hash } from './hash-request'
import { jwkBaseSchema, privateKeySchema } from './schemas'
import { EcdsaSignature, Header, Hex, Jwk, JwsdHeader, PartialJwk, Payload, PrivateKey, SigningAlg } from './types'
import { hexToBase64Url, privateKeyToHex } from './utils'
import { validate } from './validate'

const buildHeader = (jwk: Jwk, alg?: SigningAlg): Header => {
  const key = validate<PartialJwk>({
    schema: jwkBaseSchema,
    jwk,
    errorMessage: 'Invalid JWK: failed to validate basic fields'
  })
  return {
    alg: alg || key.alg,
    kid: key.kid,
    typ: 'JWT'
  }
}

const fallbackSigner = async (jwk: PrivateKey, payload: Payload, header: Header) => {
  const pk = await importJWK(jwk)
  const signature = await new SignJWT(payload).setProtectedHeader(header).sign(pk)
  return signature
}

export async function signJwsd(
  rawBody: string | object,
  header: JwsdHeader,
  signer: (payload: string) => Promise<string>
): Promise<string> {
  const encodedHeader = base64url.encode(JSON.stringify(header))
  const encodedPayload = hexToBase64Url(`0x${hash(rawBody)}`)

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
  const encodedHeader = base64url.encode(JSON.stringify(header))
  const encodedPayload = base64url.encode(JSON.stringify(payload))
  const messageToSign = `${encodedHeader}.${encodedPayload}`

  // Determine the signing logic based on the presence of a custom signer
  let signature: string
  if (actualSigner) {
    signature = await actualSigner(messageToSign)
  } else {
    // Default signer logic
    // Validate JWK as a private key for default signing
    const privateKey = validate<PrivateKey>({
      schema: privateKeySchema,
      jwk,
      errorMessage: 'Invalid JWK: failed to validate private key'
    })
    const privateKeyHex = privateKeyToHex(privateKey)
    switch (header.alg) {
      case SigningAlg.ES256K:
        signature = await buildSignerEs256k(privateKeyHex)(messageToSign)
        break
      case SigningAlg.EIP191:
        signature = await buildSignerEip191(privateKeyHex)(messageToSign)
        break
      default:
        return fallbackSigner(privateKey, payload, header)
    }
  }

  return `${messageToSign}.${signature}`
}

export const signSecp256k1 = (hash: Uint8Array, privateKey: Hex | string, isEth?: boolean): EcdsaSignature => {
  const pk = isHex(privateKey) ? privateKey.slice(2) : privateKey
  const { r, s, recovery } = secp256k1.sign(hash, pk)
  const rHex = toHex(r, { size: 32 })
  const sHex = toHex(s, { size: 32 })
  const recoveryBn = isEth ? 27n + BigInt(recovery) : BigInt(recovery)

  return {
    r: rHex,
    s: sHex,
    v: recoveryBn
  }
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
