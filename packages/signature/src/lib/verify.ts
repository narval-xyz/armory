import { p256 } from '@noble/curves/p256'
import { secp256k1 } from '@noble/curves/secp256k1'
import { sha256 as sha256Hash } from '@noble/hashes/sha256'
import { toBytes } from '@noble/hashes/utils'
import { subtle } from 'crypto'
import { hexToBytes, isAddressEqual, recoverAddress } from 'viem'
import { decodeJwsd, decodeJwt } from './decode'
import { JwtError } from './error'
import { hash } from './hash'
import { JwsdHeader, publicKeySchema } from './schemas'
import { eip191Hash } from './sign'
import { isSecp256k1PublicKeyJwk } from './typeguards'
import {
  Alg,
  Header,
  Hex,
  Jwk,
  Jwsd,
  JwsdVerifyOptions,
  JwtVerifyOptions,
  Payload,
  PublicKey,
  SigningAlg,
  type Jwt
} from './types'
import {
  base64UrlToHex,
  ed25519polyfilled as ed25519,
  hexToBase64Url,
  nowSeconds,
  publicKeyToHex,
  requestWithoutWildcardFields
} from './utils'
import { buildJwkValidator } from './validate'

export const checkRequiredClaims = (payload: Payload, opts: JwtVerifyOptions): boolean => {
  const requiredClaims = [
    ...(opts.issuer ? ['iss'] : []),
    ...(opts.audience ? ['aud'] : []),
    ...(opts.subject ? ['sub'] : []),
    ...(opts.requestHash ? ['requestHash'] : []),
    ...(opts.data ? ['data'] : []),
    ...(opts.requiredClaims || []),
    ...(opts.access ? ['access'] : [])
  ]
  if (requiredClaims.length) {
    for (const claim of requiredClaims) {
      if (payload[claim] === undefined) {
        throw new JwtError({ message: `Missing required claim: ${claim}`, context: { payload } })
      }
    }
  }
  return true
}
export const checkTokenExpiration = (payload: Payload, opts: JwtVerifyOptions): boolean => {
  const checkTime = opts.now || nowSeconds()
  if (payload.exp && payload.exp < checkTime) {
    throw new JwtError({ message: 'Token has expired', context: { payload } })
  }

  if (payload.iat && opts.maxTokenAge) {
    const expirationTime = opts.maxTokenAge + payload.iat
    if (checkTime > expirationTime) {
      throw new JwtError({ message: 'Token has expired', context: { payload } })
    }
  }
  return true
}

export const checkNbf = (payload: Payload, opts: JwtVerifyOptions): boolean => {
  const checkTime = opts.now || nowSeconds()
  if (payload.nbf && payload.nbf > checkTime) {
    throw new JwtError({ message: 'Token is not yet valid', context: { payload } })
  }
  return true
}

export const checkIssuer = (payload: Payload, opts: JwtVerifyOptions): boolean => {
  if (opts.issuer) {
    if (
      !payload.iss ||
      !(typeof opts.issuer === 'string' ? opts.issuer === payload.iss : opts.issuer.includes(payload.iss))
    ) {
      throw new JwtError({ message: 'Invalid issuer', context: { payload } })
    }
  }
  return true
}

export const checkAudience = (payload: Payload, opts: JwtVerifyOptions): boolean => {
  if (opts.audience) {
    const audiences = Array.isArray(opts.audience) ? opts.audience : [opts.audience]
    const payloadAuds = Array.isArray(payload.aud) ? payload.aud : [payload.aud]
    if (!payload.aud || !audiences.some((aud) => payloadAuds.includes(aud))) {
      throw new JwtError({ message: 'Invalid audience', context: { payload } })
    }
  }
  return true
}

export const checkSubject = (payload: Payload, opts: JwtVerifyOptions): boolean => {
  if (opts.subject) {
    if (!payload.sub || opts.subject !== payload.sub) {
      throw new JwtError({ message: 'Invalid subject', context: { payload } })
    }
  }
  return true
}

export const checkAuthorizedParty = (payload: Payload, opts: JwtVerifyOptions): boolean => {
  if (opts.authorizedParty) {
    if (!payload.azp || opts.authorizedParty !== payload.azp) {
      throw new JwtError({ message: 'Invalid authorized party', context: { payload } })
    }
  }
  return true
}

export const checkRequestHash = (payload: Payload, opts: JwtVerifyOptions): boolean => {
  if (opts.requestHash) {
    const requestHash = (() => {
      if (typeof opts.requestHash === 'string') {
        return opts.requestHash
      }

      if (opts.allowWildcard) {
        return hash(requestWithoutWildcardFields(opts.requestHash, payload.hashWildcard, opts.allowWildcard))
      }

      return hash(opts.requestHash)
    })()
    if (!payload.requestHash || requestHash !== payload.requestHash) {
      throw new JwtError({ message: 'Invalid request hash', context: { payload } })
    }
  }
  return true
}

export const checkDataHash = (payload: Payload, opts: JwtVerifyOptions): boolean => {
  if (opts.data) {
    const data = typeof opts.data === 'string' ? opts.data : hash(opts.data)
    if (!payload.data || data !== payload.data) {
      throw new JwtError({ message: 'Invalid data hash', context: { payload } })
    }
  }
  return true
}

export const checkAccess = (payload: Payload, opts: JwtVerifyOptions): boolean => {
  if (opts.access) {
    for (const access of opts.access) {
      const payloadAccess = payload.access?.find(
        ({ resource }) => resource.toLowerCase() === access.resource.toLowerCase()
      )
      if (!payloadAccess) {
        throw new JwtError({ message: 'Invalid permissions', context: { payload, access } })
      }
      if (!access.permissions) {
        continue
      }
      const missingPermissions = access.permissions.filter(
        (permission) => !payloadAccess.permissions.includes(permission)
      )
      if (!access.permissions.length || missingPermissions.length) {
        throw new JwtError({ message: 'Invalid permissions', context: { payload, missingPermissions } })
      }
    }
  }
  return true
}

export const verifySecp256k1 = async (sig: Hex, hash: Uint8Array, jwk: PublicKey): Promise<boolean> => {
  if (jwk.alg !== Alg.ES256K) {
    throw new JwtError({ message: 'Invalid JWK: signature requres ES256K', context: { jwk } })
  }
  const pubKey = await publicKeyToHex(jwk)
  // A eth sig has a `v` value of 27 or 28, so we need to remove that to get the signature
  // And we remove the 0x prefix. So that means we slice the first and last 2 bytes, leaving the 128 character signature
  const isValid = secp256k1.verify(sig.slice(2, 130), hash, pubKey.slice(2)) === true
  return isValid
}

export const verifyEd25519 = async (sig: Uint8Array, msg: Uint8Array, jwk: PublicKey): Promise<boolean> => {
  if (jwk.alg !== Alg.EDDSA) {
    throw new JwtError({ message: 'Invalid JWK: signature requires EdDSA', context: { jwk } })
  }

  const pubKey = await publicKeyToHex(jwk)

  const pubKeyBytes = hexToBytes(pubKey)

  const isValid = await ed25519.verify(sig, msg, pubKeyBytes)
  return isValid
}

export const verifyP256 = async (sig: Hex, hash: Uint8Array, jwk: PublicKey): Promise<boolean> => {
  if (jwk.alg !== Alg.ES256) {
    throw new JwtError({ message: 'Invalid JWK: signature requires ES256', context: { jwk } })
  }

  const pubKey = await publicKeyToHex(jwk)
  const isValid = p256.verify(sig.slice(2, 130), hash, pubKey.slice(2)) === true
  return isValid
}

export const verifyEip191 = async (sig: Hex, msg: string, jwk: PublicKey): Promise<boolean> => {
  const msgHash = eip191Hash(msg)

  if (jwk.alg !== Alg.ES256K) {
    throw new JwtError({ message: 'Invalid JWK: EIP191 signature requires ES256K or EDSA', context: { jwk } })
  }

  let isValid = false

  if (isSecp256k1PublicKeyJwk(jwk)) {
    isValid = await verifySecp256k1(sig, msgHash, jwk)
  } else {
    const recoveredAddress = await recoverAddress({
      hash: msgHash,
      signature: sig
    })
    isValid = isAddressEqual(recoveredAddress, jwk.addr || '0x')
  }

  return isValid
}

export const verifyRs256 = async (sig: Hex, msg: string, jwk: PublicKey): Promise<boolean> => {
  const msgBuffer = Buffer.from(msg)

  const key = await subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    true,
    ['verify']
  )

  const isValid = await subtle.verify('RSASSA-PKCS1-v1_5', key, hexToBytes(sig), msgBuffer)

  return !!isValid
}

async function verifySignature(jws: string, jwk: PublicKey, alg: SigningAlg): Promise<boolean> {
  const [headerStr, payloadStr, b64Sig] = jws.split('.')
  const verificationMsg = [headerStr, payloadStr].join('.')
  const sig = base64UrlToHex(b64Sig)

  let isValid = false
  if (alg === SigningAlg.EIP191) {
    isValid = await verifyEip191(sig, verificationMsg, jwk)
  } else if (alg === SigningAlg.ES256K) {
    const hash = sha256Hash(verificationMsg)
    isValid = await verifySecp256k1(sig, hash, jwk)
  } else if (alg === SigningAlg.ES256) {
    const hash = sha256Hash(verificationMsg)
    isValid = await verifyP256(sig, hash, jwk)
  } else if (alg === SigningAlg.RS256) {
    // in RS256, the verification does the hashing internally, so pass the data itself not the hash
    isValid = await verifyRs256(sig, verificationMsg, jwk)
  } else if (alg === SigningAlg.ED25519) {
    isValid = await verifyEd25519(hexToBytes(sig), toBytes(verificationMsg), jwk)
  }

  if (!isValid) {
    throw new JwtError({ message: 'Invalid signature', context: { jws, jwk } })
  }

  return true
}

const validatePublicKey = buildJwkValidator<PublicKey>({
  schema: publicKeySchema,
  errorMessage: 'Invalid JWK: failed to validate public key'
})

export function verifyJwtHeader(header: Header, opts?: JwtVerifyOptions): boolean {
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

/*
 * https://www.ietf.org/archive/id/draft-ietf-gnap-core-protocol-19.html#section-7.3.3-8
  If the HTTP request has content, such as an HTTP POST or PUT method, the payload of the JWS object is the Base64url encoding (without padding) of the SHA256 digest of the bytes of the content. If the request being made does not have content, such as an HTTP GET, OPTIONS, or DELETE method, the JWS signature is calculated over an empty payload.
 */
export function buildJwsdPayload(body: object = {}) {
  const deepCopyBody = JSON.parse(JSON.stringify(body))
  return hexToBase64Url(hash(deepCopyBody))
}

export async function verifyJwt(jwt: string, jwk: Jwk, opts: JwtVerifyOptions = {}): Promise<Jwt> {
  const key = validatePublicKey(jwk)
  const { header, payload, signature } = decodeJwt(jwt)

  verifyJwtHeader(header, opts)

  await verifySignature(jwt, key, header.alg)

  checkRequiredClaims(payload, opts)

  checkTokenExpiration(payload, opts)

  checkNbf(payload, opts)

  checkIssuer(payload, opts)

  checkAudience(payload, opts)

  checkSubject(payload, opts)

  checkAuthorizedParty(payload, opts)

  checkRequestHash(payload, opts)

  checkDataHash(payload, opts)

  checkAccess(payload, opts)

  return {
    header,
    payload,
    signature
  }
}

export async function verifyJwsd(jws: string, jwk: PublicKey, opts: JwsdVerifyOptions): Promise<Jwsd> {
  const key = validatePublicKey(jwk)

  const jwsdPayload = buildJwsdPayload(opts.requestBody)
  // Replace the payload part; this lets the JWT be compacted with `header..signature` to be shorter.
  // And it means we can verify the payload as part of the sig verification rather than matching separately.
  const parts = jws.split('.')
  parts[1] = jwsdPayload
  const jwsToVerify = parts.join('.')
  const { header, payload, signature } = decodeJwsd(jws)

  verifyJwsdHeader(header, {
    htm: opts.htm,
    uri: opts.uri,
    maxTokenAge: opts.maxTokenAge,
    ath: hexToBase64Url(hash(opts.accessToken))
  })

  await verifySignature(jwsToVerify, key, header.alg)

  return {
    header,
    payload,
    signature
  }
}
