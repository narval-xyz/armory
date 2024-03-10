import { base64url } from 'jose'
import { decode } from '../../decode'
import { DECODED_TOKEN, SIGNATURE_PART, SIGNED_TOKEN } from './mock'

describe('decode', () => {
  it('decodes a request successfully', async () => {
    const jwt = decode(SIGNED_TOKEN)
    expect(jwt).toEqual(DECODED_TOKEN)
  })
  it('throws an error if token is malformed', async () => {
    expect(() => decode('invalid')).toThrow()
  })
  it('throws an error if token is formed well with unmeaningful data', async () => {
    expect(() => decode('invalid.invalid.invalid')).toThrow()
  })

  it('throws an error if header is invalid', async () => {
    const encodedHeader = base64url.encode(JSON.stringify({ alg: 'invalid', kid: 'invalid' }))
    const token = `${encodedHeader}.${'invalid'}.${SIGNATURE_PART}`
    expect(() => decode(token)).toThrow()
  })
})
