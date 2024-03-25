import { p256PrivateKeySchema, rsaPrivateKeySchema, secp256k1PrivateKeySchema } from '../../schemas'
import { buildSignerEip191, signJwt } from '../../sign'
import { isHeader, isPayload } from '../../typeguards'
import { Alg, Secp256k1PrivateKey, SigningAlg } from '../../types'
import { generateJwk, secp256k1PrivateKeyToHex } from '../../utils'
import { validate } from '../../validate'
import { verifyJwt } from '../../verify'

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

describe('generateKeys', () => {
  it('generate a valid RSA key pair and return it as a JWK', async () => {
    const key = await generateJwk(Alg.RS256)
    expect(rsaPrivateKeySchema.safeParse(key).success).toBe(true)
  })

  it('generates a valid P-256 key pair and return it as a JWK', async () => {
    const key = await generateJwk(Alg.ES256)
    expect(p256PrivateKeySchema.safeParse(key).success).toBe(true)
  })

  it('generates a valid secp256k1 key pair and return it as a JWK', async () => {
    const key = await generateJwk(Alg.ES256K)
    expect(secp256k1PrivateKeySchema.safeParse(key).success).toBe(true)
  })

  it('can sign and verify with a generated secp256k1 key pair', async () => {
    const key = await generateJwk(Alg.ES256K)
    const message = 'test message'
    const payload = {
      requestHash: message
    }
    const validatedKey = validate<Secp256k1PrivateKey>(
      secp256k1PrivateKeySchema,
      key,
      'Invalid secp256k1 Private Key JWK'
    )

    const signer = buildSignerEip191(secp256k1PrivateKeyToHex(validatedKey))
    const signature = await signJwt(payload, key, { alg: SigningAlg.EIP191 }, signer)
    const isValid = await verifyJwt(signature, key)
    expect(isValid).not.toEqual(false)
  })
})
