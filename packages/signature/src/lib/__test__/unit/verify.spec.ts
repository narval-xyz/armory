import * as ed from '@noble/ed25519'
import { signatureToHex, toBytes, toHex } from 'viem'
import { JwtError } from '../../error'
import { hash } from '../../hash'
import { secp256k1PublicKeySchema } from '../../schemas'
import { signJwt, signSecp256k1 } from '../../sign'
import { Alg, Header, JwtVerifyOptions, Payload, Secp256k1PublicKey, SigningAlg } from '../../types'
import { generateJwk, nowSeconds, privateKeyToJwk, publicKeyToJwk, secp256k1PrivateKeyToJwk } from '../../utils'
import { validateJwk } from '../../validate'
import {
  checkAccess,
  checkAudience,
  checkAuthorizedParty,
  checkDataHash,
  checkIssuer,
  checkNbf,
  checkRequestHash,
  checkRequiredClaims,
  checkSubject,
  checkTokenExpiration,
  verifyEd25519,
  verifyJwsdHeader,
  verifyJwt,
  verifyJwtHeader,
  verifySecp256k1
} from '../../verify'

const ENGINE_PRIVATE_KEY = '7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

describe('verifyJwt', () => {
  const payload: Payload = {
    requestHash: '608abe908cffeab1fc33edde6b44586f9dacbc9c6fe6f0a13fa307237290ce5a',
    sub: 'test-root-user-uid',
    iss: 'https://armory.narval.xyz',
    cnf: {
      kty: 'EC',
      crv: 'secp256k1',
      alg: 'ES256K',
      use: 'sig',
      kid: '0x000c0d191308A336356BEe3813CC17F6868972C4',
      x: '04a9f3bcf6505059597f6f27ad8c0f03a3bd7a1763520b0bfec204488b8e5840',
      y: '7ee92845ab1c35a784b05fdfa567715c53bb2f29949b27714e3c1760e3709009a6'
    }
  }

  it('should verify a EIP191 JWT', async () => {
    const jwk = secp256k1PrivateKeyToJwk(`0x${ENGINE_PRIVATE_KEY}`)

    const header = {
      kid: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      alg: 'EIP191',
      typ: 'JWT'
    }
    // jwt can be re-created with `signJwt(payload, jwk, { alg: SigningAlg.EIP191 }, buildSignerEip191(ENGINE_PRIVATE_KEY))`
    const jwt =
      'eyJraWQiOiIweDJjNDg5NTIxNTk3M0NiQmQ3NzhDMzJjNDU2QzA3NGI5OWRhRjhCZjEiLCJhbGciOiJFSVAxOTEiLCJ0eXAiOiJKV1QifQ.eyJyZXF1ZXN0SGFzaCI6IjYwOGFiZTkwOGNmZmVhYjFmYzMzZWRkZTZiNDQ1ODZmOWRhY2JjOWM2ZmU2ZjBhMTNmYTMwNzIzNzI5MGNlNWEiLCJzdWIiOiJ0ZXN0LXJvb3QtdXNlci11aWQiLCJpc3MiOiJodHRwczovL2FybW9yeS5uYXJ2YWwueHl6IiwiY25mIjp7Imt0eSI6IkVDIiwiY3J2Ijoic2VjcDI1NmsxIiwiYWxnIjoiRVMyNTZLIiwidXNlIjoic2lnIiwia2lkIjoiMHgwMDBjMGQxOTEzMDhBMzM2MzU2QkVlMzgxM0NDMTdGNjg2ODk3MkM0IiwieCI6IjA0YTlmM2JjZjY1MDUwNTk1OTdmNmYyN2FkOGMwZjAzYTNiZDdhMTc2MzUyMGIwYmZlYzIwNDQ4OGI4ZTU4NDAiLCJ5IjoiN2VlOTI4NDVhYjFjMzVhNzg0YjA1ZmRmYTU2NzcxNWM1M2JiMmYyOTk0OWIyNzcxNGUzYzE3NjBlMzcwOTAwOWE2In19.gFDywYsxY2-uT6H6hyxk51CtJhAZpI8WtcvoXHltiWsoBVOot1zMo3nHAhkWlYRmD3RuLtmOYzi6TwTUM8mFyBs'

    const res = await verifyJwt(jwt, jwk)

    expect(res).toEqual({
      header,
      payload,
      signature: 'gFDywYsxY2-uT6H6hyxk51CtJhAZpI8WtcvoXHltiWsoBVOot1zMo3nHAhkWlYRmD3RuLtmOYzi6TwTUM8mFyBs'
    })
  })

  it('verifies a EIP191 JWT signed by wagmi on client', async () => {
    // Example data from devtool ui
    const policy = [
      {
        id: 'a68e8d20-0419-475c-8fcc-b17d4de8c955',
        name: 'Authorized any admin to transfer ERC721 or ERC1155 tokens',
        when: [
          {
            // TODO @samteb: remove it and regenerate jwt because this criterion doesn't exist anymore
            criterion: 'checkResourceIntegrity',
            args: null
          },
          {
            criterion: 'checkPrincipalRole',
            args: ['admin']
          },
          {
            criterion: 'checkAction',
            args: ['signTransaction']
          },
          {
            criterion: 'checkIntentType',
            args: ['transferErc721', 'transferErc1155']
          }
        ],
        then: 'permit'
      }
    ]

    // JWT signed w/ real metamask, narval dev-wallet 0x04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B
    const jwt =
      'eyJraWQiOiIweDA0QjEyRjA4NjNiODNjNzE2MjQyOWYwRWJiMERmZEEyMEUxYUE5N0IiLCJhbGciOiJFSVAxOTEiLCJ0eXAiOiJKV1QifQ.eyJkYXRhIjoiYzg2YWNkNzk3ODFmYTRjODRkZTEyNjk1YTYxODVkZWRiZDVlNTczN2UwYjlhMWEzOGYxYzliZDI4ZGE5MWJiNCIsInN1YiI6IjB4MDRCMTJGMDg2M2I4M2M3MTYyNDI5ZjBFYmIwRGZkQTIwRTFhQTk3QiIsImlzcyI6Imh0dHBzOi8vZGV2dG9vbC5uYXJ2YWwueHl6IiwiaWF0IjoxNzEwMTgyMDgxfQ.Q0p7sJxqDMhmyrCuJqH48y0sgbWUzs9zuANV0rYdyyphXMlxdBN5Jme37QNZ_NWtH-O2RNZe9nVY0iJuvDurexw'

    // We do NOT have a publicKey, only the address. So we need to be able to verify with that only.
    const res = await verifyJwt(jwt, {
      kty: 'EC',
      crv: 'secp256k1',
      alg: 'ES256K',
      use: 'sig',
      kid: 'made-up-kid-that-matches-nothing',
      addr: '0x04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B'
    })
    const policyHash = hash(policy)

    expect(res).toBeDefined()
    // Remove the 0x because we're lazy and don't want to manually regenerate the above jwt to include the 0x from the updated hash function
    expect(res.payload.data).toEqual(policyHash.slice(2))
  })

  it('verifies ES256k JWT', async () => {
    const keyId = 'es256k-kid'
    const header: Header = {
      kid: keyId,
      alg: SigningAlg.ES256K,
      typ: 'JWT'
    }

    const jwk = await generateJwk(Alg.ES256K, { keyId })
    const jwt = await signJwt(payload, jwk, { alg: SigningAlg.ES256K })

    const res = await verifyJwt(jwt, jwk)

    expect(res).toEqual({
      header,
      payload,
      signature: expect.any(String)
    })
  })

  it('verifies ES256 JWT', async () => {
    const keyId = 'es256-kid'
    const header: Header = {
      kid: keyId,
      alg: SigningAlg.ES256,
      typ: 'JWT'
    }

    const jwk = await generateJwk(Alg.ES256, { keyId })
    const jwt = await signJwt(payload, jwk, { alg: SigningAlg.ES256 })

    const res = await verifyJwt(jwt, jwk)

    expect(res).toEqual({
      header,
      payload,
      signature: expect.any(String)
    })
  })

  it('verifies RS256 JWT', async () => {
    const keyId = 'rs256-kid'
    const header: Header = {
      kid: keyId,
      alg: SigningAlg.RS256,
      typ: 'JWT'
    }

    const jwk = await generateJwk(Alg.RS256, { keyId, use: 'sig' })
    const jwt = await signJwt(payload, jwk, { alg: SigningAlg.RS256 })

    const res = await verifyJwt(jwt, jwk)

    expect(res).toEqual({
      header,
      payload,
      signature: expect.any(String)
    })
  })

  it('throws on invalid signature', async () => {
    expect.assertions(1)
    const keyId = 'es256k-kid'

    const jwk = await generateJwk(Alg.ES256K, { keyId })
    const jwt = await signJwt(payload, jwk, { alg: SigningAlg.ES256K })
    // replace the jwt header
    const parts = jwt.split('.')
    parts[0] =
      'eyJraWQiOiIweDJjNDg5NTIxNTk3M0NiQmQ3NzhDMzJjNDU2QzA3NGI5OWRhRjhCZjEiLCJhbGciOiJFSVAxOTEiLCJ0eXAiOiJKV1QifQ'
    const invalidJwt = parts.join('.')

    await expect(verifyJwt(invalidJwt, jwk)).rejects.toThrow(JwtError)
  })
})

describe('verifySecp256k1', () => {
  it('verifies raw secp256k1 signatures', async () => {
    const msg = toBytes('My ASCII message')
    const jwk = privateKeyToJwk(`0x${ENGINE_PRIVATE_KEY}`, Alg.ES256K)
    const pubKey = validateJwk<Secp256k1PublicKey>({
      schema: secp256k1PublicKeySchema,
      jwk
    })

    const signature = await signSecp256k1(msg, ENGINE_PRIVATE_KEY, true)
    const hexSignature = signatureToHex(signature)
    const isVerified = await verifySecp256k1(hexSignature, msg, pubKey)
    expect(isVerified).toEqual(true)
  })
})

describe('verifyEd215519', () => {
  it('verifies raw ed25519 signatures', async () => {
    const msg = toBytes('My ASCII message')
    const key = ed.utils.randomPrivateKey()
    const pubKey = await ed.getPublicKey(key)

    const jwk = publicKeyToJwk(toHex(pubKey), Alg.EDDSA)
    const signature = await ed.sign(msg, key)

    const isVerified = await ed.verify(signature, msg, pubKey)
    const isVerifiedByUs = await verifyEd25519(signature, msg, jwk)

    expect(isVerifiedByUs).toEqual(isVerified)
  })
})

describe('verifyJwtHeader', () => {
  it('returns true when all recognized crit parameters are present in the header', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      typ: 'JWT',
      crit: ['b64'],
      b64: false
    }

    const result = verifyJwtHeader(header as Header)

    expect(result).toEqual(true)
  })

  it('throws JwtError when unrecognized crit parameter is present in the header', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      typ: 'JWT',
      crit: ['unknown']
    }

    expect(() => verifyJwtHeader(header as Header)).toThrow(JwtError)
  })

  it('throws JwtError when crit parameter is missing from the header', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      typ: 'JWT',
      crit: ['unknown']
    }

    expect(() =>
      verifyJwtHeader(header as Header, {
        crit: ['unknown']
      })
    ).toThrow(JwtError)
  })

  it('does not throw when custom crit param is recognized', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      typ: 'JWT',
      crit: ['custom'],
      custom: 'value' // This is a custom claim that is recognized
    }

    expect(() =>
      verifyJwtHeader(header as Header, {
        crit: ['custom']
      })
    ).not.toThrow()
  })
})

describe('verifyJwsdHeader', () => {
  it('should verify the JwsdHeader', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      typ: 'gnap-binding-jwsd',
      htm: 'example-htm',
      uri: 'example-uri',
      created: nowSeconds(),
      ath: 'example-ath'
    }

    const opts = {
      htm: 'example-htm',
      uri: 'example-uri',
      maxTokenAge: 3600,
      ath: 'example-ath'
    }

    expect(() => verifyJwsdHeader(header as Header, opts)).not.toThrow()
  })

  it('throws for missing standard header fields', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      htm: 'invalid-htm',
      uri: 'example-uri',
      created: nowSeconds(),
      ath: 'example-ath'
    }

    const opts = {
      htm: 'example-htm',
      uri: 'example-uri',
      maxTokenAge: 3600,
      ath: 'example-ath'
    }

    expect(() => verifyJwsdHeader(header as Header, opts)).toThrow(JwtError)
  })

  it('throws an error for invalid htm field in JwsdHeader', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      typ: 'gnap-binding-jwsd',
      htm: 'invalid-htm',
      uri: 'example-uri',
      created: nowSeconds(),
      ath: 'example-ath'
    }

    const opts = {
      htm: 'example-htm',
      uri: 'example-uri',
      maxTokenAge: 3600,
      ath: 'example-ath'
    }

    expect(() => verifyJwsdHeader(header as Header, opts)).toThrow(JwtError)
  })

  it('throws an error for invalid uri field in JwsdHeader', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      typ: 'gnap-binding-jwsd',
      htm: 'example-htm',
      uri: 'invalid-uri',
      created: nowSeconds(),
      ath: 'example-ath'
    }

    const opts = {
      htm: 'example-htm',
      uri: 'example-uri',
      maxTokenAge: 3600,
      ath: 'example-ath'
    }

    expect(() => verifyJwsdHeader(header as Header, opts)).toThrow(JwtError)
  })

  it('throws an error for JWS that is too old', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      typ: 'gnap-binding-jwsd',
      htm: 'example-htm',
      uri: 'example-uri',
      created: nowSeconds() - 7200, // 2 hours ago
      ath: 'example-ath'
    }

    const opts = {
      htm: 'example-htm',
      uri: 'example-uri',
      maxTokenAge: 3600,
      ath: 'example-ath'
    }

    expect(() => verifyJwsdHeader(header as Header, opts)).toThrow(JwtError)
  })

  it('throws an error for invalid ath field in JwsdHeader', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      typ: 'gnap-binding-jwsd',
      htm: 'example-htm',
      uri: 'example-uri',
      created: nowSeconds(),
      ath: 'invalid-ath'
    }

    const opts = {
      htm: 'example-htm',
      uri: 'example-uri',
      maxTokenAge: 3600,
      ath: 'example-ath'
    }

    expect(() => verifyJwsdHeader(header as Header, opts)).toThrow(JwtError)
  })
})

describe('checkRequiredClaims', () => {
  it('throws JwtError when a required claim is missing', () => {
    const payload: Payload = {
      sub: 'test-subject',
      iss: 'https://example.com',
      exp: 1635638400 // Expiration time in Unix timestamp format
    }

    const opts = {
      requiredClaims: ['sub', 'iss', 'exp', 'aud'] // 'aud' claim is missing in the payload
    }

    expect(() => checkRequiredClaims(payload, opts)).toThrow(JwtError)
  })

  it('returns true when all required claims are present', () => {
    const payload: Payload = {
      sub: 'test-subject',
      iss: 'https://example.com',
      exp: 1635638400, // Expiration time in Unix timestamp format
      aud: 'https://api.example.com'
    }

    const opts = {
      requiredClaims: ['sub', 'iss', 'exp', 'aud']
    }

    expect(() => checkRequiredClaims(payload, opts)).not.toThrow()
  })

  it('returns true when no required claims are specified', () => {
    const payload: Payload = {
      sub: 'test-subject',
      iss: 'https://example.com',
      exp: 1635638400 // Expiration time in Unix timestamp format
    }

    const opts = {
      requiredClaims: []
    }

    const result = checkRequiredClaims(payload, opts)

    expect(result).toEqual(true)
  })

  it('requires iss if Issuer verify option is passed', () => {
    const payload: Payload = {
      sub: 'test-subject',
      exp: 1635638400
    }

    const opts: JwtVerifyOptions = {
      issuer: 'https://example.com'
    }

    expect(() => checkRequiredClaims(payload, opts)).toThrow(JwtError)
  })

  it('requires aud if audience verify option is passed', () => {
    const payload: Payload = {
      sub: 'test-subject',
      exp: 1635638400
    }

    const opts: JwtVerifyOptions = {
      audience: 'https://api.example.com'
    }

    expect(() => checkRequiredClaims(payload, opts)).toThrow(JwtError)
  })
  it('requires sub if subject verify option is passed', () => {
    const payload: Payload = {
      iss: 'https://example.com',
      exp: 1635638400
    }

    const opts: JwtVerifyOptions = {
      subject: 'test-subject'
    }

    expect(() => checkRequiredClaims(payload, opts)).toThrow(JwtError)
  })

  it('requires requesthash if requestHash verify option is passed', () => {
    const payload: Payload = {
      iss: 'https://example.com',
      exp: 1635638400
    }

    const opts: JwtVerifyOptions = {
      requestHash: '0x1234567890'
    }

    expect(() => checkRequiredClaims(payload, opts)).toThrow(JwtError)
  })

  it('requires data if data verify option is passed', () => {
    const payload: Payload = {
      iss: 'https://example.com',
      exp: 1635638400
    }

    const opts: JwtVerifyOptions = {
      data: '0x1234567890'
    }

    expect(() => checkRequiredClaims(payload, opts)).toThrow(JwtError)
  })
})

describe('checkTokenExpiration', () => {
  it('throws JwtError when token has expired', () => {
    const payload = {
      exp: nowSeconds() - 3600 // Expired 1 hour ago
    }
    const opts = {
      now: nowSeconds()
    }

    expect(() => checkTokenExpiration(payload, opts)).toThrow(JwtError)
  })

  it('throws JwtError when token has exceeded maxTokenAge', () => {
    const payload = {
      iat: nowSeconds() - 7200 // Issued 2 hours ago
    }
    const opts = {
      now: nowSeconds(),
      maxTokenAge: 3600
    }

    expect(() => checkTokenExpiration(payload, opts)).toThrow(JwtError)
  })

  it('returns true when token has not expired', () => {
    const payload = {
      exp: nowSeconds() + 3600 // Expires in 1 hour
    }
    const opts = {
      now: nowSeconds()
    }

    const result = checkTokenExpiration(payload, opts)

    expect(result).toEqual(true)
  })

  it('allows overwriting `now` with a custom value', () => {
    const payload = {
      exp: nowSeconds() - 3600 // 1 hour ago
    }
    const opts = {
      now: nowSeconds() - 7200 // 2 hours ago
    }

    const result = checkTokenExpiration(payload, opts)

    expect(result).toEqual(true)
  })
})

describe('checkNbf', () => {
  it('returns true when the token is valid', () => {
    const payload: Payload = {
      nbf: nowSeconds() - 3600 // 1 hour ago
    }

    const result = checkNbf(payload, {})

    expect(result).toEqual(true)
  })

  it('throws JwtError when the token is not yet valid', () => {
    const payload: Payload = {
      nbf: nowSeconds() + 3600 // 1 hour from now
    }

    expect(() => checkNbf(payload, {})).toThrow(JwtError)
  })
})

describe('checkIssuer', () => {
  it('returns true when the issuer is valid', () => {
    const payload: Payload = {
      iss: 'https://example.com'
    }

    expect(
      checkIssuer(payload, {
        issuer: 'https://example.com'
      })
    ).toEqual(true)

    expect(
      checkIssuer(payload, {
        issuer: ['https://other.com', 'https://example.com']
      })
    ).toEqual(true)
  })

  it('throws JwtError when the issuer is invalid', () => {
    const payload: Payload = {
      iss: 'https://example.com'
    }

    const opts = {
      issuer: 'https://invalid.com'
    }

    expect(() => checkIssuer(payload, opts)).toThrow(JwtError)
  })
})

describe('checkAudience', () => {
  it('returns true when the audience is valid', () => {
    const payload: Payload = {
      aud: 'https://api.example.com'
    }

    expect(
      checkAudience(payload, {
        audience: 'https://api.example.com'
      })
    ).toEqual(true)

    expect(
      checkAudience(payload, {
        audience: ['https://api.other.com', 'https://api.example.com']
      })
    ).toEqual(true)
  })

  it('throws JwtError when the audience is invalid', () => {
    const payload: Payload = {
      aud: 'https://api.example.com'
    }

    const opts = {
      audience: 'https://invalid.com'
    }

    expect(() => checkAudience(payload, opts)).toThrow(JwtError)
  })

  it('throws JwtError when the payload aud is empty', () => {
    const payload: Payload = {}

    const opts = {
      audience: 'https://invalid.com'
    }

    expect(() => checkAudience(payload, opts)).toThrow(JwtError)
    expect(() => checkAudience({ aud: '' }, opts)).toThrow(JwtError)
  })

  it('supports an aud as an array', () => {
    const payload: Payload = {
      aud: ['https://api.other.com', 'https://api.example.com']
    }

    expect(
      checkAudience(payload, {
        audience: 'https://api.example.com'
      })
    ).toEqual(true)
  })
})

describe('checkSubject', () => {
  it('returns true when the subject is valid', () => {
    const payload: Payload = {
      sub: 'test-subject'
    }

    expect(
      checkSubject(payload, {
        subject: 'test-subject'
      })
    ).toEqual(true)
  })

  it('throws JwtError when the subject is invalid', () => {
    const payload: Payload = {
      sub: 'test-subject'
    }

    const opts = {
      subject: 'invalid-subject'
    }

    expect(() => checkSubject(payload, opts)).toThrow(JwtError)
  })
})

describe('checkAuthorizedParty', () => {
  it('returns true when the azp is valid', () => {
    const payload: Payload = {
      azp: 'my-client-id'
    }

    expect(
      checkAuthorizedParty(payload, {
        authorizedParty: 'my-client-id'
      })
    ).toEqual(true)
  })

  it('throws JwtError when the azp is invalid', () => {
    const payload: Payload = {
      azp: 'my-client-id'
    }

    const opts = {
      authorizedParty: 'invalid-client'
    }

    expect(() => checkAuthorizedParty(payload, opts)).toThrow(JwtError)
  })
})

describe('checkRequestHash', () => {
  it('returns true when the requestHash is a string & matches', () => {
    const payload: Payload = {
      requestHash: '0x1234567890'
    }

    expect(
      checkRequestHash(payload, {
        requestHash: '0x1234567890'
      })
    ).toEqual(true)
  })

  it('throws JwtError when the requestHash does not match', () => {
    const payload: Payload = {
      requestHash: '0x1234567890'
    }

    const opts: JwtVerifyOptions = {
      requestHash: '0x0987654321'
    }

    expect(() => checkRequestHash(payload, opts)).toThrow(JwtError)
  })

  it('hashes a request object and compares it to the requestHash', () => {
    const request = {
      method: 'POST',
      url: 'https://example.com',
      body: 'Hello, world!'
    }
    const requestHash = hash(request)

    const payload: Payload = {
      requestHash
    }

    const opts: JwtVerifyOptions = {
      requestHash: request
    }
    const result = checkRequestHash(payload, opts)
    expect(result).toEqual(true)
  })

  it('hashes all fields of the request object if opts.allowWildcard is not set', () => {
    const request = {
      method: 'POST',
      url: 'https://example.com',
      body: 'Hello, world!'
    }
    const requestHash = hash(request)

    const payload: Payload = {
      requestHash,
      hashWildcard: ['method', 'url']
    }

    const opts: JwtVerifyOptions = {
      requestHash: {
        method: 'POST',
        url: 'https://example.com',
        body: 'Hello, world!'
      }
    }
    const result = checkRequestHash(payload, opts)
    expect(result).toEqual(true)
  })

  it('throws if all the field wildcarded are not in opts.allowWildcard', () => {
    const request = {
      method: 'POST',
      url: 'https://example.com',
      body: 'Hello, world!'
    }
    const requestHash = hash({ body: request.body })

    const payload: Payload = {
      requestHash,
      hashWildcard: ['method', 'url']
    }

    const opts: JwtVerifyOptions = {
      requestHash: {
        method: 'POST',
        url: 'https://example.com',
        body: 'Hello, world!'
      },
      allowWildcard: ['method']
    }
    try {
      checkRequestHash(payload, opts)
    } catch (err: any) {
      expect(err).toBeInstanceOf(JwtError)
      expect(err.message).toEqual('Invalid request hash')
    }
  })
})

describe('checkDataHash', () => {
  it('returns true when the data is a string & matches', () => {
    const payload: Payload = {
      data: '0x1234567890'
    }

    expect(
      checkDataHash(payload, {
        data: '0x1234567890'
      })
    ).toEqual(true)
  })

  it('throws JwtError when the data does not match', () => {
    const payload: Payload = {
      data: '0x1234567890'
    }

    const opts: JwtVerifyOptions = {
      data: '0x0987654321'
    }

    expect(() => checkDataHash(payload, opts)).toThrow(JwtError)
  })

  it('hashes a request object and compares it to the data', () => {
    const data = {
      method: 'POST',
      url: 'https://example.com',
      body: 'Hello, world!'
    }
    const dataHash = hash(data)

    const payload: Payload = {
      data: dataHash
    }

    const opts: JwtVerifyOptions = {
      data
    }
    const result = checkDataHash(payload, opts)
    expect(result).toEqual(true)
  })
})

describe('checkAccess', () => {
  const payload: Payload = {
    access: [
      {
        resource: 'vault',
        permissions: ['wallet:create', 'wallet:read']
      }
    ]
  }

  it('returns true when the access is valid', () => {
    expect(
      checkAccess(payload, {
        access: [
          {
            resource: 'vault',
            permissions: ['wallet:create', 'wallet:read']
          }
        ]
      })
    ).toEqual(true)

    expect(
      checkAccess(payload, {
        access: [
          {
            resource: 'vault',
            permissions: ['wallet:read']
          }
        ]
      })
    ).toEqual(true)
  })

  it('supports undefined for permissions and this acts as a wildcard', () => {
    expect(
      checkAccess(payload, {
        access: [
          {
            resource: 'vault'
          }
        ]
      })
    ).toEqual(true)
  })

  it('throws JwtError when resource is not valid', () => {
    const payload: Payload = {
      access: []
    }

    expect(() =>
      checkAccess(payload, {
        access: [
          {
            resource: 'vault',
            permissions: ['wallet:import']
          }
        ]
      })
    ).toThrow(JwtError)
  })

  it('throws JwtError when permissions are not valid', () => {
    expect(() =>
      checkAccess(payload, {
        access: [
          {
            resource: 'vault',
            permissions: ['wallet:import']
          }
        ]
      })
    ).toThrow(JwtError)
  })

  it('throws JwtError when permissions is an empty array', () => {
    expect(() =>
      checkAccess(payload, {
        access: [
          {
            resource: 'vault',
            permissions: []
          }
        ]
      })
    ).toThrow(JwtError)
  })
})
