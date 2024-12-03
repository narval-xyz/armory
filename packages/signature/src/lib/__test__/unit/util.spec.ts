import { toHex } from 'viem'
import { hash } from '../../hash'
import {
  ed25519PrivateKeySchema,
  p256PrivateKeySchema,
  rsaPrivateKeySchema,
  secp256k1PrivateKeySchema
} from '../../schemas'
import { buildSignerEip191, signJwt } from '../../sign'
import {
  Alg,
  Header,
  Jwk,
  RsaPrivateKey,
  Secp256k1PrivateKey,
  SigningAlg,
  p256PublicKeySchema,
  secp256k1PublicKeySchema
} from '../../types'
import {
  ed25519polyfilled,
  ellipticPrivateKeyToHex,
  generateJwk,
  privateKeyToHex,
  privateKeyToJwk,
  publicKeyToHex,
  publicKeyToJwk,
  requestWithoutWildcardFields,
  rsaPrivateKeyToPublicKey
} from '../../utils'
import { validateJwk } from '../../validate'
import { verifyJwt } from '../../verify'

const rsaJwk: Jwk = {
  kty: 'RSA',
  alg: 'RS256',
  kid: '0x52920ad0d19d7779106bd9d9d600d26c4b976cdb3cbc49decb7fdc29db00b8e9',
  n: 'xNdTjWL9hGa4bz4tLKbmFZ4yjQsQzW35-CMS0kno3403jEqg5y2Cs6sLVyPBX4N2hdK5ERPytpf1PrThHqB-eEO6LtEWpENBgFuNIf8DRHrv0tne7dLNxf7sx1aocGRrkgIk4Ws6Is4Ot3whm3-WihmDGnHoogE-EPwVkkSc2FYPXYlNq4htCZXC8_MUI3LuXry2Gn4tna5HsYSehYhfKDD-nfSajeWxdNUv_3wOeSCr9ICm9Udlo7hpIUHQgnX3Nz6kvfGYuweLGoj_ot-oEUCIdlbQqmrfStAclugbM5NI6tY__6wD0z_4ZBjToupXCBlXbYsde6_ZG9xPmYSykw',
  e: 'AQAB',
  d: 'QU4rIzpXX8jwob-gHzNUHJH6tX6ZWX6GM0P3p5rrztc8Oag8z9XyigdSYNu0-SpVdTqfOcJDgT7TF7XNBms66k2WBJhMCb1iiuJU5ZWEkQC0dmDgLEkHCgx0pAHlKjy2z580ezEm_YsdqNRfFgbze-fQ7kIiazU8UUhBI-DtpHv7baBgsfqEfQ5nCTiURUPmmpiIU74-ZIJWZjBXTOoJNH0EIsJK9IpZzxpeC9mTMTsWTcHKiR3acze1qf-9I97v461TTZ8e33N6YINyr9I4HZuvxlCJdV_lOM3fLvYM9gPvgkPozhVWL3VKR6xa9JpGGHrCRgH92INuviBB_SmF8Q',
  p: '9BNku_-t4Df9Dg7M2yjiNgZgcTNKrDnNqexliIUAt67q0tGmSBubjxeI5unDJZ_giXWUR3q-02v7HT5GYx-ZVgKk2lWnbrrm_F7UZW-ueHzeVvQcjDXTk0z8taXzrDJgnIwZIaZ2XSG3P-VPOrXCaMba8GzSq38Gpzi4g3lTO9s',
  q: 'znUtwrqdnVew14_aFjNTRgzOQNN8JhkjzJy3aTSLBScK5NbiuUUZBWs5dQ7Nv7aAoDss1-o9XVQZ1DVV-o9UufJtyrPNcvTnC0cWRrtJrSN5YiuUbECU3Uj3OvGxnhx9tsmhDHnMTo50ObPYUbHcIkNaXkf2FVgL84y1JRWdPak',
  dp: 'UNDrFeS-6fMf8zurURXkcQcDf_f_za8GDjGcHOwNJMTiNBP-_vlFNMgSKINWfmrFqj4obtKRxOeIKlKoc8HOv8_4TeL2oY95VC8CHOQx3Otbo2cI3NQlziw7sNnWKTo1CyDIYYAAyS2Uw69l4Ia2bIMLk3g0-VwCE_SQA9h0Wuk',
  dq: 'VBe6ieSFKn97UnIPfJdvRcsVf6YknUgEIuV6d2mlbnXWpBs6wgf5BxIDl0BuYbYuchVoUJHiaM9Grf8DhEk5U3wBaF0QQ9CpAxjzY-AJRHJ8kJX7oJQ1jmSX_vRPSn2EXx2FcZVyuFSh1pcAd1YgufwBJQHepBb21z7q0a4aG_E',
  qi: 'KhZpFs6xfyRIjbJV8Q9gWxqF37ONayIzBpgio5mdAQlZ-FUmaWZ2_2VWP2xvsP48BmwFXydHqewHBqGnZYCQ1ZHXJgD_-KKEejoqS5AJN1pdI0ZKjs7UCfZ4RJ4DH5p0_35gpuKRzzdvcIhl1CjIC5W8o7nhwmLBJ_QAo9e4t9U'
}

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

const eddsaKey: Jwk = {
  kty: 'OKP',
  crv: 'Ed25519',
  alg: 'EDDSA',
  kid: '0xaf8dcff8da6aae18c2170f59a0734c8c5c19ca726a1b75993857bd836db00a5f',
  x: 'HrmLI5NH3cYp4-HluFGBOcYvARGti_oz0aZMXMzy8m4',
  d: 'nq2eDJPp9NAqCdTT_dNerIJFJxegTKmFgDAsFkhbJIA'
}

const k1HexPublicKey =
  '0x048cf0cf42e721a1ab479fb27fb5a4674ae6bf5a00357144a8552bb66eff875be3b045bb4ce358c2788941d8bf403840d4e0e0089196b5f8015900972aeed54b84'

const k1HexPrivateKey = '0x10d4eff718cc1ba4641f06a6b4e9379749a51ce64dee17ab28512618f3ca2b4e'

const p256HexPublicKey =
  '0x046efe944311e4955214040e3f0056eaa3d7db8443fce9764506ed556f8fa9c35408dfa6d8b07a68cc1b8668be732289e3da91956922ba9645f07eca9aa9531e2c'

const p256HexPrivateKey = '0xd9cf695be325ab8d849fc60a5eb92bf45c8b0c81527d5e3926a951f0732c4157'

const eddsaHexPublicKey = '0x1eb98b239347ddc629e3e1e5b8518139c62f0111ad8bfa33d1a64c5cccf2f26e'

const eddsaHexPrivateKey = '0x9ead9e0c93e9f4d02a09d4d3fdd35eac82452717a04ca98580302c16485b2480'

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

  it('generates a valid ed25519 key pair and return it as a JWK', async () => {
    const key = await generateJwk(Alg.EDDSA)
    expect(ed25519PrivateKeySchema.safeParse(key).success).toBe(true)
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

  it('can sign and verify with a generated ed25519 key pair', async () => {
    const key = await generateJwk(Alg.EDDSA)

    const message = hash('test message')
    const payload = {
      requestHash: message
    }

    const signature = await signJwt(payload, key)
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
    const jwk = secp256k1PublicKeySchema.parse(publicKeyToJwk(k1HexPublicKey, Alg.ES256K))
    expect(jwk.kty).toBe('EC')
    expect(jwk.crv).toBe('secp256k1')
    expect(jwk.x).toBeDefined()
    expect(jwk.y).toBeDefined()
  })

  it('converts a valid ES256 hex public key to JWK', () => {
    const jwk = p256PublicKeySchema.parse(publicKeyToJwk(p256HexPublicKey, Alg.ES256))
    expect(jwk.kty).toBe('EC')
    expect(jwk.crv).toBe('P-256')
    expect(jwk.x).toBeDefined()
    expect(jwk.y).toBeDefined()
  })

  it('allows setting the keyId directly', () => {
    const jwk1 = publicKeyToJwk(k1HexPublicKey, Alg.ES256K, 'myKey1')
    expect(jwk1.kid).toBe('myKey1')
    const jwk2 = publicKeyToJwk(p256HexPublicKey, Alg.ES256, 'myKey2')
    expect(jwk2.kid).toBe('myKey2')
  })

  it('converts a valid EDDSA hex public key to JWK', async () => {
    const jwk = publicKeyToJwk(eddsaHexPublicKey, Alg.EDDSA)
    const { d: _d, ...eddsaPublicKey } = eddsaKey
    expect(jwk).toEqual(eddsaPublicKey)
  })

  it('ensures hex consistency across standard and polyfill implementations', async () => {
    const key = ed25519polyfilled.utils.randomPrivateKey()
    const publicKey = ed25519polyfilled.sync.getPublicKey(key)
    const asyncPublicKey = await ed25519polyfilled.getPublicKey(key)

    const publicHexKey = await publicKeyToHex(privateKeyToJwk(toHex(key), Alg.EDDSA))

    expect(publicHexKey).toEqual(toHex(publicKey))
    expect(publicHexKey).toEqual(toHex(asyncPublicKey))
  })
})

describe('publicKeyToHex', () => {
  it('converts a valid secp256k1 JWK to hex string', async () => {
    const hex = await publicKeyToHex(k1Jwk)
    expect(hex).toBe(k1HexPublicKey)
  })

  it('converts a valid p256 JWK to hex string', async () => {
    const hex = await publicKeyToHex(p256Jwk)
    expect(hex).toBe(p256HexPublicKey)
  })

  it('converts a valid rsa JWK to hex string', async () => {
    const hex = await publicKeyToHex(rsaJwk)
    expect(hex).toEqual(
      '0x30820122300d06092a864886f70d01010105000382010f003082010a0282010100c4d7538d62fd8466b86f3e2d2ca6e6159e328d0b10cd6df9f82312d249e8df8d378c4aa0e72d82b3ab0b5723c15f837685d2b91113f2b697f53eb4e11ea07e7843ba2ed116a44341805b8d21ff03447aefd2d9deedd2cdc5feecc756a870646b920224e16b3a22ce0eb77c219b7f968a19831a71e8a2013e10fc1592449cd8560f5d894dab886d0995c2f3f3142372ee5ebcb61a7e2d9dae47b1849e85885f2830fe9df49a8de5b174d52fff7c0e7920abf480a6f54765a3b8692141d08275f7373ea4bdf198bb078b1a88ffa2dfa81140887656d0aa6adf4ad01c96e81b339348ead63fffac03d33ff86418d3a2ea570819576d8b1d7bafd91bdc4f9984b2930203010001'
    )
  })

  it('converts a valid eddsa JWK to hex string', async () => {
    const hex = await publicKeyToHex(eddsaKey)
    expect(hex).toBe(eddsaHexPublicKey)
  })
})

describe('privateKeyToHex', () => {
  it('converts a valid secp256k1 private JWK to hex string', async () => {
    const hex = await privateKeyToHex(k1Jwk)
    expect(hex).toBe(k1HexPrivateKey)
  })

  it('converts a valid p256 private JWK to hex string', async () => {
    const hex = await privateKeyToHex(p256Jwk)
    expect(hex).toBe(p256HexPrivateKey)
  })

  it('converts a valid eddsa private JWK to hex string', async () => {
    const hex = await privateKeyToHex(eddsaKey)
    expect(hex).toBe(eddsaHexPrivateKey)
  })

  it('throws an error for invalid private key', async () => {
    const jwk: Jwk = {
      kty: 'EC',
      crv: 'secp256k1'
    }
    await expect(privateKeyToHex(jwk)).rejects.toThrow('Invalid Private Key')
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

  // TODO: Implement this test & functionality. Not direct need today, but should be done.
  // it('converts a valid rs256 hex private key to JWK', async () => {
  //   const key = await generateJwk(Alg.RS256)
  //   const hex = privateKeyToHex(key)
  //   const jwk = privateKeyToJwk(hex, Alg.RS256)
  //   expect(rsaPrivateKeySchema.safeParse(jwk).success).toBe(true)
  // })
})

describe('hashRequestWithoutWildcardFields', () => {
  const transaction = {
    chainId: 137,
    from: '0x084e6a5e3442d348ba5e149e362846be6fcf2e9e',
    maxFeePerGas: '100',
    maxPriorityFeePerGas: '100',
    nonce: 0
  }

  const request = {
    action: 'signTransaction',
    nonce: '123',
    transactionRequest: transaction,
    resourceId: 'eip155:eoa:0x084e6a5e3442d348ba5e149e362846be6fcf2e9e'
  }

  const wildcardedFields = ['transactionRequest.maxFeePerGas', 'transactionRequest.maxPriorityFeePerGas']

  const transactionWithoutWildcards = {
    chainId: 137,
    from: '0x084e6a5e3442d348ba5e149e362846be6fcf2e9e',
    nonce: 0
  }
  it('hashes the request without wildcard fields accepted in options', () => {
    const hashedRequest = hash(
      requestWithoutWildcardFields(request, wildcardedFields, [
        'transactionRequest.maxFeePerGas',
        'transactionRequest.maxPriorityFeePerGas'
      ])
    )
    const expectedHash = hash({
      ...request,
      transactionRequest: transactionWithoutWildcards
    })

    expect(hashedRequest).toEqual(expectedHash)
  })

  it("doesn't modify the original request", () => {
    requestWithoutWildcardFields(request, wildcardedFields)
    expect(request.transactionRequest).toEqual(transaction)
  })

  it("hashes the full object if request doesn't have the wildcarded fields", () => {
    const hashedRequest = hash(
      requestWithoutWildcardFields(request, ['some.invalid.path', 'transaction.invalid', 'typedData'])
    )
    const expectedHash = hash(request)

    expect(hashedRequest).toEqual(expectedHash)
  })

  it('hashes the full object if no wildcarded fields are provided', () => {
    const hashedRequest = hash(requestWithoutWildcardFields(request, []))
    const expectedHash = hash(request)

    expect(hashedRequest).toEqual(expectedHash)
  })

  it('supports bignumber values', () => {
    const transaction = {
      chainId: 137,
      from: '0x084e6a5e3442d348ba5e149e362846be6fcf2e9e',
      maxFeePerGas: 100n,
      maxPriorityFeePerGas: 100n,
      nonce: 0
    }

    const request = {
      action: 'signTransaction',
      nonce: '123',
      transactionRequest: transaction,
      resourceId: 'eip155:eoa:0x084e6a5e3442d348ba5e149e362846be6fcf2e9e'
    }

    const wildcardedFields = ['transactionRequest.maxFeePerGas', 'transactionRequest.maxPriorityFeePerGas']

    const transactionWithoutWildcards = {
      chainId: 137,
      from: '0x084e6a5e3442d348ba5e149e362846be6fcf2e9e',
      nonce: 0
    }

    const hashedRequest = hash(
      requestWithoutWildcardFields(request, wildcardedFields, [
        'transactionRequest.maxFeePerGas',
        'transactionRequest.maxPriorityFeePerGas'
      ])
    )
    const expectedHash = hash({
      ...request,
      transactionRequest: transactionWithoutWildcards
    })

    expect(hashedRequest).toEqual(expectedHash)
  })
})
