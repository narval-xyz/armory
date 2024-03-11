import { secp256k1 } from '@noble/curves/secp256k1'
import { importJWK, jwtVerify } from 'jose'
import { isAddressEqual, recoverAddress } from 'viem'
import { decode } from './decode'
import { JwtError } from './error'
import { eip191Hash } from './sign'
import { Hex, JWK, Jwt, Payload, SigningAlg } from './types'
import { base64UrlToHex, jwkToPublicKey } from './utils'

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

const verifyEip191WithPublicKey = async (sig: Hex, hash: Uint8Array, jwk: JWK): Promise<boolean> => {
  const pub = jwkToPublicKey(jwk)

  // A eth sig has a `v` value of 27 or 28, so we need to remove that to get the signature
  // And we remove the 0x prefix. So that means we slice the first and last 2 bytes, leaving the 128 character signature
  const isValid = secp256k1.verify(sig.slice(2, 130), hash, pub.slice(2)) === true
  if (!isValid) {
    throw new Error('Invalid JWT signature')
  }
  return isValid
}

export const verifyEip191 = async (jwt: string, jwk: JWK): Promise<boolean> => {
  const [headerStr, payloadStr, jwtSig] = jwt.split('.')
  const verificationMsg = [headerStr, payloadStr].join('.')
  const msg = eip191Hash(verificationMsg)
  const sig = base64UrlToHex(jwtSig)

  // If we have an Address but no x & y, recover the address from the signature to verify
  // Otherwise, verify directly against the public key from the x&y.
  if (jwk.x && jwk.y) {
    await verifyEip191WithPublicKey(sig, msg, jwk)
  } else if (jwk.addr) {
    await verifyEip191WithRecovery(sig, msg, jwk.addr)
  } else {
    throw new Error('Invalid JWK, no x & y or address')
  }

  return true
}

export async function verifyJwt(jwt: string, jwk: JWK): Promise<Jwt> {
  const { header, payload, signature } = decode(jwt)

  if (header.alg === SigningAlg.EIP191) {
    await verifyEip191(jwt, jwk)
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
