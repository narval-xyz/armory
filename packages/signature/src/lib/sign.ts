import { secp256k1 } from '@noble/curves/secp256k1'
import { sha256 as sha256Hash } from '@noble/hashes/sha256'
import { keccak_256 as keccak256 } from '@noble/hashes/sha3'
import { SignJWT, base64url, importJWK } from 'jose'
import { signatureToHex, toBytes, toHex } from 'viem'
import { EcdsaSignature, Header, JWK, Payload, SigningAlg } from './types'
import { hexToBase64Url } from './utils'

// WIP to replace `sign`
export async function signJwt(
  payload: Payload,
  jwk: JWK,
  opts: { alg?: SigningAlg } = {},
  signer?: (payload: string) => Promise<string>
): Promise<string> {
  const header: Header = {
    kid: jwk.kid,
    alg: opts.alg || jwk.alg, // TODO: add separate type for `ES256k-KECCAK`
    typ: 'JWT'
  }

  if (header.alg === SigningAlg.ES256K || header.alg === SigningAlg.EIP191) {
    if (!signer) {
      throw new Error('Missing signer')
    }
    const encodedHeader = base64url.encode(JSON.stringify(header))
    const encodedPayload = base64url.encode(JSON.stringify(payload))

    const messageToSign = `${encodedHeader}.${encodedPayload}`

    const signature = await signer(messageToSign)

    const completeJWT = `${messageToSign}.${signature}`
    return completeJWT
  }

  const privateKey = await importJWK(jwk)
  const jwt = await new SignJWT(payload).setProtectedHeader(header).sign(privateKey)
  return jwt
}

export const signSecp256k1 = (hash: Uint8Array, privateKey: string, isEth?: boolean): EcdsaSignature => {
  const { r, s, recovery } = secp256k1.sign(hash, privateKey)
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
  (privateKey: string) =>
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
  (privateKey: string) =>
  async (messageToSign: string): Promise<string> => {
    const hash = eip191Hash(messageToSign)

    const signature = signSecp256k1(hash, privateKey, true)
    const hexSignature = signatureToHex(signature)
    return hexToBase64Url(hexSignature)
  }
