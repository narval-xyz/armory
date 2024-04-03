import { p256PrivateKeySchema, rsaPrivateKeySchema, secp256k1PrivateKeySchema } from '../../schemas'
import { buildSignerEip191, signJwt } from '../../sign'
import { Alg, Header, Jwk, RsaPrivateKey, Secp256k1PrivateKey, SigningAlg } from '../../types'
import {
  ellipticPrivateKeyToHex,
  generateJwk,
  privateKeyToHex,
  privateKeyToJwk,
  publicKeyToHex,
  publicKeyToJwk,
  rsaPrivateKeyToPublicKey
} from '../../utils'
import { validateJwk } from '../../validate'
import { verifyJwt } from '../../verify'

const p256Jwk: Jwk = {
  kty: 'EC',
  crv: 'P-256',
  alg: 'ES256',
  kid: '0x58816C7A72b63dd68f97562Df26cb6E37c54fF0b',
  x: 'bv6UQxHklVIUBA4_AFbqo9fbhEP86XZFBu1Vb4-pw1Q',
  y: 'CN-m2LB6aMwbhmi-cyKJ49qRlWkiupZF8H7KmqlTHiw',
  d: '2c9pW-Mlq42En8YKXrkr9FyLDIFSfV45JqlR8HMsQVc'
}

const k1Jwk: Jwk = {
  kty: 'EC',
  crv: 'secp256k1',
  alg: 'ES256K',
  kid: '0x89aa3f9287b68ac4251de7efca47672e9257863025a8a712119a8699b9c56d91',
  x: 'jPDPQuchoatHn7J_taRnSua_WgA1cUSoVSu2bv-HW-M',
  y: 'sEW7TONYwniJQdi_QDhA1ODgCJGWtfgBWQCXKu7VS4Q',
  d: 'ENTv9xjMG6RkHwamtOk3l0mlHOZN7herKFEmGPPKK04'
}

const k1HexPublicKey =
  '0x048cf0cf42e721a1ab479fb27fb5a4674ae6bf5a00357144a8552bb66eff875be3b045bb4ce358c2788941d8bf403840d4e0e0089196b5f8015900972aeed54b84'

const k1HexPrivateKey = '0x10d4eff718cc1ba4641f06a6b4e9379749a51ce64dee17ab28512618f3ca2b4e'

const p256HexPublicKey =
  '0x046efe944311e4955214040e3f0056eaa3d7db8443fce9764506ed556f8fa9c35408dfa6d8b07a68cc1b8668be732289e3da91956922ba9645f07eca9aa9531e2c'

const p256HexPrivateKey = '0xd9cf695be325ab8d849fc60a5eb92bf45c8b0c81527d5e3926a951f0732c4157'

describe('isHeader', () => {
  it('returns true for a valid header object', () => {
    const validHeader = { alg: 'ES256', kid: 'test-kid', typ: 'JWT' }
    expect(Header.safeParse(validHeader).success).toBe(true)
  })

  it('returns false for an object missing the alg property', () => {
    const invalidHeader = { kid: 'test-kid' }
    expect(Header.safeParse(invalidHeader).success).toBe(false)
  })

  it('returns false for an object with an invalid alg property', () => {
    const invalidHeader = { alg: 'invalid-alg', kid: 'test-kid' }
    expect(Header.safeParse(invalidHeader).success).toBe(false)
  })

  it('returns false for an object missing the kid property', () => {
    const invalidHeader = { alg: 'ES256' }
    expect(Header.safeParse(invalidHeader).success).toBe(false)
  })

  it('returns false for null', () => {
    expect(Header.safeParse(null).success).toBe(false)
  })

  it('returns false for a non-object', () => {
    expect(Header.safeParse('string').success).toBe(false)
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
    const validatedKey = validateJwk<Secp256k1PrivateKey>({
      schema: secp256k1PrivateKeySchema,
      jwk: key,
      errorMessage: 'Invalid secp256k1 private key'
    })

    const signer = buildSignerEip191(ellipticPrivateKeyToHex(validatedKey))
    const signature = await signJwt(payload, key, { alg: SigningAlg.EIP191 }, signer)
    const isValid = await verifyJwt(signature, key)
    expect(isValid).not.toEqual(false)
  })

  describe('rsaPrivateKeyToPublicKey', () => {
    it('converts private to public', async () => {
      const privateKey = await generateJwk<RsaPrivateKey>(Alg.RS256, { use: 'enc' })
      const publicKey = rsaPrivateKeyToPublicKey(privateKey)
      expect(publicKey).toEqual({
        alg: Alg.RS256,
        e: expect.any(String),
        kid: expect.any(String),
        kty: 'RSA',
        n: expect.any(String),
        use: 'enc'
      })
    })
  })
})

describe('publicKeyToJwk', () => {
  it('converts a valid ES256K hex public key to JWK', () => {
    const jwk = publicKeyToJwk(k1HexPublicKey, Alg.ES256K)
    expect(jwk.kty).toBe('EC')
    expect(jwk.crv).toBe('secp256k1')
    expect(jwk.x).toBeDefined()
    expect(jwk.y).toBeDefined()
  })

  it('converts a valid ES256 hex public key to JWK', () => {
    const jwk = publicKeyToJwk(p256HexPublicKey, Alg.ES256)
    expect(jwk.kty).toBe('EC')
    expect(jwk.crv).toBe('P-256')
    expect(jwk.x).toBeDefined()
    expect(jwk.y).toBeDefined()
  })
})

describe('publicKeyToHex', () => {
  it('converts a valid secp256k1 JWK to hex string', () => {
    const hex = publicKeyToHex(k1Jwk)
    expect(hex).toBe(k1HexPublicKey)
  })

  it('converts a valid p256 JWK to hex string', () => {
    const hex = publicKeyToHex(p256Jwk)
    expect(hex).toBe(p256HexPublicKey)
  })
})

describe('privateKeyToHex', () => {
  it('converts a valid secp256k1 private JWK to hex string', () => {
    const hex = privateKeyToHex(k1Jwk)
    expect(hex).toBe(k1HexPrivateKey)
  })

  it('converts a valid p256 private JWK to hex string', () => {
    const hex = privateKeyToHex(p256Jwk)
    expect(hex).toBe(p256HexPrivateKey)
  })

  it('throws an error for invalid private key', () => {
    const jwk: Jwk = {
      kty: 'EC',
      crv: 'secp256k1'
    }
    expect(() => privateKeyToHex(jwk)).toThrow('Invalid Private Key')
  })
})

describe('privateKeyToJwk', () => {
  it('converts a valid secp256k1 hex private key to JWK', () => {
    const jwk = privateKeyToJwk(k1HexPrivateKey, Alg.ES256K)
    expect(secp256k1PrivateKeySchema.safeParse(jwk).success).toBe(true)
  })

  it('converts a valid p256 hex private key to JWK', () => {
    const jwk = privateKeyToJwk(p256HexPrivateKey, Alg.ES256)
    expect(p256PrivateKeySchema.safeParse(jwk).success).toBe(true)
  })

  it('throws an error for RS256 alg', () => {
    expect(() => privateKeyToJwk(p256HexPrivateKey, Alg.RS256)).toThrow()
  })
})
