import { Header, Payload, SigningAlg } from './types'

function isAlg(alg: unknown): alg is SigningAlg {
  return typeof alg === 'string' && Object.values(SigningAlg).includes(alg as SigningAlg)
}

function isStringNonNull(kid: unknown): kid is string {
  return typeof kid === 'string' && kid.length > 0
}

export function isHeader(header: unknown): header is Header {
  return (
    typeof header === 'object' &&
    header !== null &&
    'alg' in header &&
    'kid' in header &&
    isAlg(header.alg) &&
    isStringNonNull(header.kid)
  )
}

function isDate(date: unknown): date is Date {
  if (date instanceof Date) {
    return true
  }
  if (typeof date === 'string') {
    const parsed = Date.parse(date)
    return !isNaN(parsed)
  }
  if (typeof date === 'number') {
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }
  return false
}

// TODO: Probably don't need this; we won't always require payloads to have these specific fields, they're all optional
export function isPayload(payload: unknown): payload is Payload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'requestHash' in payload &&
    'iat' in payload &&
    'exp' in payload &&
    isStringNonNull(payload.requestHash) &&
    isDate(payload.iat) &&
    isDate(payload.exp)
  )
}
