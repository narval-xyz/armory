import { isHeader, isPayload } from '../../typeguards'

describe('isHeader', () => {
  it('returns true for a valid header object', () => {
    const validHeader = { alg: 'ES256', kid: 'test-kid' }
    expect(isHeader(validHeader)).toBe(true)
  })

  it('returns false for an object missing the alg property', () => {
    const invalidHeader = { kid: 'test-kid' }
    expect(isHeader(invalidHeader)).toBe(false)
  })

  it('returns false for an object with an invalid alg property', () => {
    const invalidHeader = { alg: 'invalid-alg', kid: 'test-kid' }
    expect(isHeader(invalidHeader)).toBe(false)
  })

  it('returns false for an object missing the kid property', () => {
    const invalidHeader = { alg: 'ES256' }
    expect(isHeader(invalidHeader)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isHeader(null)).toBe(false)
  })

  it('returns false for a non-object', () => {
    expect(isHeader('string')).toBe(false)
  })
})

describe('isPayload', () => {
  it('returns true for a valid payload object', () => {
    const validPayload = { requestHash: 'hash', iat: new Date(12783712894), exp: new Date(123456) }
    expect(isPayload(validPayload)).toBe(true)
  })

  it('returns false for an object missing the requestHash property', () => {
    const invalidPayload = { iat: 123456 }
    expect(isPayload(invalidPayload)).toBe(false)
  })

  it('returns false for an object with an invalid iat property', () => {
    const invalidPayload = { requestHash: 'hash', iat: 'invalid-iat' }
    expect(isPayload(invalidPayload)).toBe(false)
  })

  it('returns false for an object missing the iat property', () => {
    const invalidPayload = { requestHash: 'hash' }
    expect(isPayload(invalidPayload)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isPayload(null)).toBe(false)
  })

  it('returns false for a non-object', () => {
    expect(isPayload('string')).toBe(false)
  })
})
