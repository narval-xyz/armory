import { Header, Payload } from './types'

export function isHeader(header: unknown): header is Header {
  return (
    typeof header === 'object' &&
    header !== null &&
    'alg' in header &&
    'kid' in header &&
    typeof header.alg === 'string' &&
    typeof header.kid === 'string' &&
    (header.alg === 'ES256K' || header.alg === 'ES256') &&
    header.kid.length > 0
  )
}

export function isPayload(payload: unknown): payload is Payload {
  return typeof payload === 'object' && payload !== null && 'requestHash' in payload && 'iat' in payload
}
