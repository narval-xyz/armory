import { secp256k1 } from '@noble/curves/secp256k1'
import { importJWK, jwtVerify } from 'jose'
import { isAddressEqual, recoverAddress } from 'viem'
import { decodeJwsd, decodeJwt } from './decode'
import { JwtError } from './error'
import { JwsdHeader, publicKeySchema } from './schemas'
import { eip191Hash } from './sign'
import { isSepc256k1PublicKeyJwk } from './typeguards'
import { Alg, Header, Hex, Jwk, Jwsd, Payload, PublicKey, Secp256k1PublicKey, SigningAlg, type Jwt } from './types'
import { base64UrlToHex, nowSeconds, publicKeyToHex } from './utils'
import { buildValidator } from './validate'

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

const validatePublicKey = buildValidator<PublicKey>({
  schema: publicKeySchema,
  errorMessage: 'Invalid JWK: failed to validate public key'
})

export function verifyJwtHeader(header: Header, opts?: { crit?: string[] }): boolean {
  const recognized = new Map([...(opts?.crit || []), 'b64'].map((key) => [key, true]))

  if (header.crit) {
    for (const parameter of header.crit) {
      // Check that the parameter in `crit` is recognized by our system
      if (!recognized.has(parameter)) {
        throw new JwtError({
          message: `Extension Header Parameter "${parameter}" is not recognized`,
          context: { header }
        })
      }

      // Check that the header actually includes the crit param
      if (header[parameter] === undefined) {
        throw new JwtError({
          message: `Extension Header Parameter "${parameter}" is missing`,
          context: { header }
        })
      }
    }
  }

  return true
}

// https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-19.html#name-detached-jws
export function verifyJwsdHeader(
  header: Header,
  opts?: {
    htm: string
    uri: string
    maxTokenAge: number // seconds since creation
    ath?: string
  }
): boolean {
  // Ensure we have all the required jwsd header fields
  const parsed = JwsdHeader.safeParse(header)
  if (!parsed.success) {
    throw new JwtError({
      message: 'Invalid Jwsd header',
      context: { header, errors: parsed.error }
    })
  }
  const jwsdHeader = parsed.data
  // If we don't have opts, then we'll accept any values as long as the required values exist
  // this is not recommended for production use
  if (!opts) return true

  if (jwsdHeader.htm !== opts.htm) {
    throw new JwtError({
      message: 'Invalid htm field in jws header',
      context: { header, opts }
    })
  }
  if (jwsdHeader.uri !== opts.uri) {
    throw new JwtError({
      message: 'Invalid uri field in jws header',
      context: { header, opts }
    })
  }
  const now = nowSeconds()
  if (jwsdHeader.created && now - jwsdHeader.created > opts.maxTokenAge) {
    throw new JwtError({
      message: 'JWS is too old, created field is too far in the past',
      context: { header, opts }
    })
  }

  if (opts.ath && jwsdHeader.ath !== opts.ath) {
    throw new JwtError({
      message: 'Invalid ath field in jws header',
      context: { header, opts }
    })
  }

  return true
}

export async function verifyJwt(jwt: string, jwk: Jwk): Promise<Jwt> {
  const key = validatePublicKey(jwk)
  const { header, payload, signature } = decodeJwt(jwt)

  verifyJwtHeader(header)

  if (header.alg === SigningAlg.EIP191) {
    await verifyEip191(jwt, key)
  } else {
    // TODO: Implement other algs individually without jose
    const joseJwk = await importJWK(key)
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
  const key = validatePublicKey(jwk)
  const { header, payload, signature } = decodeJwsd(jws)

  verifyJwsdHeader(header)

  if (header.alg === SigningAlg.EIP191) {
    await verifyEip191(jws, key)
  } else {
    // TODO: Implement other algs individually without jose
    const joseJwk = await importJWK(key)
    await jwtVerify(jws, joseJwk)
  }

  return {
    header,
    payload,
    signature
  }
}
