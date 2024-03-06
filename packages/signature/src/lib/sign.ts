import { secp256k1 } from '@noble/curves/secp256k1'
import { sha256 as sha256Hash } from '@noble/hashes/sha256'
import { keccak_256 as keccak256 } from '@noble/hashes/sha3'
import { SignJWT, base64url, importPKCS8 } from 'jose'
import { isHex, signatureToHex, toBytes, toHex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { JwtError } from './error'
import { hash } from './hash-request'
import { Alg, EcdsaSignature, Header, JWK, Payload, SignatureInput, SigningAlg } from './types'
import { hexToBase64Url } from './utils'

const DEF_EXP_TIME = '2h'

const eoaKeys = async (signingInput: SignatureInput): Promise<string> => {
  const { request, privateKey, algorithm, kid, iat, exp } = signingInput

  if (!isHex(privateKey)) {
    throw new JwtError({ message: 'Invalid private key', context: { privateKey } })
  }

  const account = privateKeyToAccount(privateKey)
  const iatNumeric = iat
  const expNumeric = exp
  const header = { alg: algorithm, kid }
  const payload = {
    requestHash: hash(request),
    iat: iatNumeric,
    exp: expNumeric
  }

  const encodedHeader = base64url.encode(JSON.stringify(header))
  const encodedPayload = base64url.encode(JSON.stringify(payload))

  const messageToSign = `${encodedHeader}.${encodedPayload}`
  const signature = await account.signMessage({ message: messageToSign })

  const completeJWT = `${messageToSign}.${base64url.encode(toBytes(signature))}`
  return completeJWT
}

/**
 * Signs a request using the provided private key and algorithm.
 *
 * @param {SignatureInput} signingInput - The input required to sign a request.
 * @returns {Promise<string>} A promise that resolves with the signed JWT.
 */
export async function sign(signingInput: SignatureInput): Promise<string> {
  const { request, privateKey: pk, algorithm, kid, iat, exp } = signingInput

  try {
    if (isHex(pk) && algorithm === Alg.ES256K) {
      return eoaKeys(signingInput)
    }
    const privateKey = await importPKCS8(pk, algorithm)
    const requestHash = hash(request)

    const jwt = await new SignJWT({ requestHash })
      .setProtectedHeader({ alg: algorithm, kid })
      .setIssuedAt(iat)
      .setExpirationTime(exp || DEF_EXP_TIME)
      .sign(privateKey)
    return jwt
  } catch (error) {
    console.log(error);
    throw new JwtError({ message: 'Failed to sign request.', context: { error } })
  }
}

// WIP to replace `sign`
export async function signJwt(
  payload: Payload,
  jwk: JWK,
  opts: { alg?: SigningAlg },
  signer: (payload: string) => Promise<string>
): Promise<string> {
  const header: Header = {
    kid: jwk.kid,
    alg: opts.alg || jwk.alg, // TODO: add separate type for `ES256k-KECCAK`
    typ: 'JWT'
  }

  const encodedHeader = base64url.encode(JSON.stringify(header))
  const encodedPayload = base64url.encode(JSON.stringify(payload))

  const messageToSign = `${encodedHeader}.${encodedPayload}`

  const signature = await signer(messageToSign)

  const completeJWT = `${messageToSign}.${signature}`
  return completeJWT
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
