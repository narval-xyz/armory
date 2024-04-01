import { signatureToHex, toBytes } from 'viem'
import { JwtError } from '../../error'
import { hash } from '../../hash-request'
import { secp256k1PublicKeySchema } from '../../schemas'
import { signSecp256k1 } from '../../sign'
import { Alg, Header, Payload, Secp256k1PublicKey } from '../../types'
import { privateKeyToJwk, secp256k1PrivateKeyToJwk } from '../../utils'
import { validate } from '../../validate'
import { verifyJwsdHeader, verifyJwt, verifyJwtHeader, verifySepc256k1 } from '../../verify'

describe('verify', () => {
  const ENGINE_PRIVATE_KEY = '7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

  it('should verify a EIP191-signed JWT', async () => {
    const jwk = secp256k1PrivateKeyToJwk(`0x${ENGINE_PRIVATE_KEY}`)

    const header = {
      kid: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      alg: 'EIP191',
      typ: 'JWT'
    }

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

  it('verifies a JWT signed by wagmi on client', async () => {
    // Example data from devtool ui
    const policy = [
      {
        id: 'a68e8d20-0419-475c-8fcc-b17d4de8c955',
        name: 'Authorized any admin to transfer ERC721 or ERC1155 tokens',
        when: [
          {
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
    expect(res.payload.data).toEqual(policyHash)
  })

  it('verifies raw secp256k1 signatures', async () => {
    const msg = toBytes('My ASCII message')
    const jwk = privateKeyToJwk(`0x${ENGINE_PRIVATE_KEY}`, Alg.ES256K)
    const pubKey = validate<Secp256k1PublicKey>({
      schema: secp256k1PublicKeySchema,
      jwk
    })

    const signature = await signSecp256k1(msg, ENGINE_PRIVATE_KEY, true)
    const hexSignature = signatureToHex(signature)
    const isVerified = await verifySepc256k1(hexSignature, msg, pubKey)
    expect(isVerified).toEqual(true)
  })
})

describe('verifyJwtHeader', () => {
  it('should return true when all recognized crit parameters are present in the header', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      typ: 'JWT',
      crit: ['b64'],
      b64: false
    }

    const result = verifyJwtHeader(header as Header)

    expect(result).toBe(true)
  })

  it('should throw JwtError when unrecognized crit parameter is present in the header', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      typ: 'JWT',
      crit: ['unknown']
    }

    expect(() => verifyJwtHeader(header as Header)).toThrow(JwtError)
  })

  it('should throw JwtError when crit parameter is missing from the header', () => {
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
      created: Math.floor(Date.now() / 1000),
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

  it('should throw for missing standard header fields', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      htm: 'invalid-htm',
      uri: 'example-uri',
      created: Math.floor(Date.now() / 1000),
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

  it('should throw an error for invalid htm field in JwsdHeader', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      typ: 'gnap-binding-jwsd',
      htm: 'invalid-htm',
      uri: 'example-uri',
      created: Math.floor(Date.now() / 1000),
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

  it('should throw an error for invalid uri field in JwsdHeader', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      typ: 'gnap-binding-jwsd',
      htm: 'example-htm',
      uri: 'invalid-uri',
      created: Math.floor(Date.now() / 1000),
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

  it('should throw an error for JWS that is too old', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      typ: 'gnap-binding-jwsd',
      htm: 'example-htm',
      uri: 'example-uri',
      created: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
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

  it('should throw an error for invalid ath field in JwsdHeader', () => {
    const header = {
      kid: 'kid1',
      alg: 'ES256K',
      typ: 'gnap-binding-jwsd',
      htm: 'example-htm',
      uri: 'example-uri',
      created: Math.floor(Date.now() / 1000),
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
