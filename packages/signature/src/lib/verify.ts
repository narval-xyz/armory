import { secp256k1 } from '@noble/curves/secp256k1'
import { importJWK, jwtVerify } from 'jose'
import { isAddressEqual, recoverAddress } from 'viem'
import { decode, decodeJwsd } from './decode'
import { JwtError } from './error'
import { publicKeySchema } from './schemas'
import { eip191Hash } from './sign'
import { isSepc256k1PublicKeyJwk } from './typeguards'
import { Alg, Hex, Jwk, Jwsd, Jwt, Payload, PublicKey, Secp256k1PublicKey, SigningAlg } from './types'
import { base64UrlToHex, publicKeyToHex } from './utils'
import { validate } from './validate'

const checkTokenExpiration = (payload: Payload): boolean => {
  const now = Math.floor(Date.now() / 1000)
  if (payload.exp && payload.exp < now) {
    throw new JwtError({ message: 'Token has expired', context: { payload } })
  }
  return true
}

const verifyEip191WithRecovery = async (sig: Hex, hash: Uint8Array, address: Hex): Promise<boolean> => {
  const recoveredAddress = await recoverAddress({
    hash,
    signature: sig
  })
  if (!isAddressEqual(recoveredAddress, address)) {
    throw new Error('Invalid JWT signature')
  }
  return true
}

const verifyEip191WithPublicKey = async (sig: Hex, hash: Uint8Array, jwk: PublicKey): Promise<boolean> => {
  if (isSepc256k1PublicKeyJwk(jwk)) {
    const pub = publicKeyToHex(jwk)
    // A eth sig has a `v` value of 27 or 28, so we need to remove that to get the signature
    // And we remove the 0x prefix. So that means we slice the first and last 2 bytes, leaving the 128 character signature
    const isValid = secp256k1.verify(sig.slice(2, 130), hash, pub.slice(2)) === true
    if (!isValid) {
      throw new Error('Invalid JWT signature')
    }
    return isValid
  }
  throw new JwtError({
    message: 'Validation error: unsupported algorithm',
    context: { jwk }
  })
}

export const verifySepc256k1 = async (sig: Hex, hash: Uint8Array, jwk: Secp256k1PublicKey): Promise<boolean> => {
  const pubKey = publicKeyToHex(jwk)
  const isValid = secp256k1.verify(sig.slice(2, 130), hash, pubKey.slice(2)) === true
  return isValid
}

export const verifyEip191 = async (jwt: string, jwk: PublicKey): Promise<boolean> => {
  const [headerStr, payloadStr, jwtSig] = jwt.split('.')
  const verificationMsg = [headerStr, payloadStr].join('.')
  const msg = eip191Hash(verificationMsg)
  const sig = base64UrlToHex(jwtSig)

  if (jwk.alg === Alg.ES256K) {
    if (isSepc256k1PublicKeyJwk(jwk)) {
      await verifyEip191WithPublicKey(sig, msg, jwk)
    } else {
      await verifyEip191WithRecovery(sig, msg, jwk.addr)
    }
  } else {
    throw new JwtError({
      message: 'Validation error: unsupported algorithm',
      context: { jwk }
    })
  }

  return true
}

export async function verifyJwt(jwt: string, jwk: Jwk): Promise<Jwt> {
  const { header, payload, signature } = decode(jwt)
  const key = validate<PublicKey>({
    schema: publicKeySchema,
    jwk,
    errorMessage: 'Invalid JWK: failed to validate public key'
  })

  if (header.alg === SigningAlg.EIP191) {
    await verifyEip191(jwt, key)
  } else {
    // TODO: Implement other algs individually without jose
    const joseJwk = await importJWK(jwk)
    await jwtVerify<Payload>(jwt, joseJwk)
  }

  // Payload validity checks
  checkTokenExpiration(payload)
  // TODO: Check for any other fields that might be relevant

  return {
    header,
    payload,
    signature
  }
}

export async function verifyJwsd(jws: string, jwk: PublicKey): Promise<Jwsd> {
  const { header, payload, signature } = decodeJwsd(jws)

  if (header.alg === SigningAlg.EIP191) {
    await verifyEip191(jws, jwk)
  } else {
    // TODO: Implement other algs individually without jose
    const joseJwk = await importJWK(jwk)
    await jwtVerify(jws, joseJwk)
  }

  return {
    header,
    payload,
    signature
  }
}
