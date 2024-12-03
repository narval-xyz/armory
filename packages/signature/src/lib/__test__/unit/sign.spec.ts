import { secp256k1 } from '@noble/curves/secp256k1'
import { sha256 as sha256Hash } from '@noble/hashes/sha256'
import { toBytes } from '@noble/hashes/utils'
import { exportJWK, importPKCS8 } from 'jose'
import { createPublicKey } from 'node:crypto'
import { toHex, verifyMessage } from 'viem'
import { privateKeyToAccount, signMessage } from 'viem/accounts'
import {
  buildSignerEdDSA,
  buildSignerEip191,
  buildSignerEs256k,
  signJwt,
  signSecp256k1,
  signatureToHex
} from '../../sign'
import { Alg, Curves, Jwk, KeyTypes, Payload, PrivateKey, SigningAlg } from '../../types'
import {
  base64UrlToBytes,
  base64UrlToHex,
  ed25519polyfilled as ed,
  ellipticPrivateKeyToHex,
  ellipticPublicKeyToHex,
  generateJwk,
  hexToBase64Url,
  privateKeyToHex,
  privateKeyToJwk,
  publicKeyToHex,
  secp256k1PrivateKeyToJwk,
  secp256k1PublicKeyToJwk
} from '../../utils'
import { verifyJwt } from '../../verify'
import { HEADER_PART, PAYLOAD_PART, PRIVATE_KEY_PEM } from './mock'

describe('sign', () => {
  const UNSAFE_PRIVATE_KEY = '7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'
  const ED25519_PRIVATE_KEY = '0xe6ad32d225c16074bd4a3b62e28c99dd26136ef341e6368ca05227d1e13822d9'

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

  it('sign build & sign es256 JWT correctly with a PEM', async () => {
    const key = await importPKCS8(PRIVATE_KEY_PEM, Alg.ES256)
    const jwk = await exportJWK(key)
    const maybeJwk: Jwk = {
      alg: Alg.ES256,
      crv: Curves.P256,
      kty: KeyTypes.EC,
      kid: 'somekid',
      use: undefined,
      x: jwk.x,
      y: jwk.y,
      d: jwk.d
    }
    const jwt = await signJwt(payload, maybeJwk, { alg: SigningAlg.ES256 })
    const verified = await verifyJwt(jwt, maybeJwk)
    expect(verified.payload).toEqual(payload)
  })
  it('build & sign a EIP191 JWT', async () => {
    const jwk = secp256k1PrivateKeyToJwk(`0x${UNSAFE_PRIVATE_KEY}`)
    const signer = buildSignerEip191(UNSAFE_PRIVATE_KEY)

    const jwt = await signJwt(payload, jwk, { alg: SigningAlg.EIP191 }, signer)

    const [headerStr, payloadStr, jwtSig] = jwt.split('.')

    // Test that we can verify the sig / viem
    const verified = await verifyMessage({
      address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      message: [headerStr, payloadStr].join('.'),
      signature: base64UrlToHex(jwtSig)
    })

    expect(verified).toBe(true)

    const decodedPayload = base64UrlToBytes(payloadStr).toString('utf-8')

    expect(JSON.parse(decodedPayload)).toEqual(payload)

    // Make sure OUR verification function also works
    const isVerified = await verifyJwt(jwt, jwk)
    expect(isVerified).toBeTruthy()
  })

  it('sign ES256k correctly', async () => {
    const pubkey = secp256k1.getPublicKey(Buffer.from(UNSAFE_PRIVATE_KEY, 'hex'), false)
    const message = [HEADER_PART, PAYLOAD_PART].join('.')
    const signer = buildSignerEs256k(UNSAFE_PRIVATE_KEY)
    const signature = await signer(message)
    const msgHash = sha256Hash(message)

    const isVerified = secp256k1.verify(base64UrlToBytes(signature), msgHash, pubkey)
    expect(isVerified).toBe(true)

    expect(signature).toBe('FFI6M5oFpbQqq0-xhe5DgPVHj4CKoVF4F3K3cg1MRY1COqWatQNsSn2MrqJ10BbGLe7i76KRMDj4biqnZkxwsw')
  })

  it('sign RS256 correctly', async () => {
    const key = await generateJwk(Alg.RS256)
    const jwt = await signJwt(payload, key)
    const verifiedJwt = await verifyJwt(jwt, key)
    expect(verifiedJwt.payload).toEqual(payload)
  })

  it('sign EIP191 correctly', async () => {
    const message = [HEADER_PART, PAYLOAD_PART].join('.')
    const signer = buildSignerEip191(UNSAFE_PRIVATE_KEY)
    const signature = await signer(message)

    expect(signature).toBe('afu_-8eYXRpHAt_nTVRksRmiwVZpq7iC2rBVhGQT5YcJlViKV9wD3OIlRYAxa7JkNd1Yqzf_x2ohLzqGjmlb2hs')
  })

  it('sign ED25519 correctly', async () => {
    const signer = buildSignerEdDSA(ED25519_PRIVATE_KEY)
    const jwk = privateKeyToJwk(ED25519_PRIVATE_KEY, Alg.EDDSA)
    const publicHexKey = await publicKeyToHex(jwk)

    const message = [HEADER_PART, PAYLOAD_PART].join('.')

    const messageBytes = toBytes(message)

    const signature = await signer(message)

    const signatureWithout0x = base64UrlToHex(signature)

    const isVerified = await ed.verify(signatureWithout0x.slice(2), messageBytes, publicHexKey.slice(2))
    expect(isVerified).toBe(true)
  })

  it('sign EIP191 the same as viem', async () => {
    // Just double-check that we're building a signature & base64url encoding the same thing we'd get from Viem.
    const message = [HEADER_PART, PAYLOAD_PART].join('.')
    const signer = buildSignerEip191(UNSAFE_PRIVATE_KEY)
    const signature = await signer(message)

    const viemSig = await signMessage({
      message,
      privateKey: `0x${UNSAFE_PRIVATE_KEY}`
    })

    const sigHex = base64UrlToHex(signature)

    expect(sigHex).toBe(viemSig)
  })

  it('be able to verify an EIP191-signed JWT', async () => {
    const jwt =
      'eyJraWQiOiIweDJjNDg5NTIxNTk3M0NiQmQ3NzhDMzJjNDU2QzA3NGI5OWRhRjhCZjEiLCJhbGciOiJFUzI1NkstS0VDQ0FLIiwidHlwIjoiSldUIn0.eyJyZXF1ZXN0SGFzaCI6IjYwOGFiZTkwOGNmZmVhYjFmYzMzZWRkZTZiNDQ1ODZmOWRhY2JjOWM2ZmU2ZjBhMTNmYTMwNzIzNzI5MGNlNWEiLCJzdWIiOiJ0ZXN0LXJvb3QtdXNlci11aWQiLCJpYXQiOjE3MDk3NjAyMTEsImV4cCI6MTcwOTc2MDgxMSwiaXNzIjoiaHR0cHM6Ly9hcm1vcnkubmFydmFsLnh5eiIsImNuZiI6eyJrdHkiOiJFQyIsImNydiI6InNlY3AyNTZrMSIsImFsZyI6IkVTMjU2SyIsInVzZSI6InNpZyIsImtpZCI6IjB4MDAwYzBkMTkxMzA4QTMzNjM1NkJFZTM4MTNDQzE3RjY4Njg5NzJDNCIsIngiOiIwNGE5ZjNiY2Y2NTA1MDU5NTk3ZjZmMjdhZDhjMGYwM2EzYmQ3YTE3NjM1MjBiMGJmZWMyMDQ0ODhiOGU1ODQwIiwieSI6IjdlZTkyODQ1YWIxYzM1YTc4NGIwNWZkZmE1Njc3MTVjNTNiYjJmMjk5NDliMjc3MTRlM2MxNzYwZTM3MDkwMDlhNiJ9fQ.9toU-AkKVqbLvguKt85s28VsdXDpjmVVJhQPyzX_OdJaVo5LZkGG8gRNrEWSjgM54RgIid09mHXcGU4vu1-Wchs'
    const [headerStr, payloadStr, jwtSig] = jwt.split('.')
    const sigBuff = base64UrlToBytes(jwtSig)

    const verified = await verifyMessage({
      address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      message: [headerStr, payloadStr].join('.'),
      signature: sigBuff
    })
    expect(verified).toBe(true)

    const payload = base64UrlToBytes(payloadStr).toString('utf-8')

    expect(JSON.parse(payload)).toEqual({
      requestHash: '608abe908cffeab1fc33edde6b44586f9dacbc9c6fe6f0a13fa307237290ce5a',
      sub: 'test-root-user-uid',
      iat: 1709760211,
      exp: 1709760811,
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
    })
  })

  // This is testing that we can turn a private key into a JWK, and the way we know it's a "correct" JWK is by using the `createPublicKey` function from node's crypto module. If it throws an error, that means it's not a valid JWK
  it('make keyobject', async () => {
    const publicKey = secp256k1.getPublicKey(UNSAFE_PRIVATE_KEY, false)
    const viemPubKey = privateKeyToAccount(`0x${UNSAFE_PRIVATE_KEY}`).publicKey
    expect(toHex(publicKey)).toBe(viemPubKey) // Confirm that our key is in fact the same as what viem would give.

    const jwk = secp256k1PrivateKeyToJwk(`0x${UNSAFE_PRIVATE_KEY}`)

    const k = await createPublicKey({
      format: 'jwk',
      key: jwk
    })

    expect(k).toBeDefined()
  })

  it('converts to and from jwk', async () => {
    const jwk = secp256k1PrivateKeyToJwk(`0x${UNSAFE_PRIVATE_KEY}`)
    const pk = ellipticPrivateKeyToHex(jwk)
    expect(pk).toBe(`0x${UNSAFE_PRIVATE_KEY}`)
  })

  it('converts to and from public jwk', async () => {
    const publicKey = secp256k1.getPublicKey(UNSAFE_PRIVATE_KEY, false)
    const jwk = secp256k1PublicKeyToJwk(toHex(publicKey))
    const pk = ellipticPublicKeyToHex(jwk)
    expect(pk).toBe(toHex(publicKey))
  })

  it('signs using a custom signer and a key without material', async () => {
    const privateKey = secp256k1PrivateKeyToJwk(`0x${UNSAFE_PRIVATE_KEY}`)
    const mapOfKeys = new Map<string, PrivateKey>().set(privateKey.kid, privateKey)

    function createSignerWithKid(kid: string): (message: string) => Promise<string> {
      return async (message: string) => {
        const privateKeyMaterial = mapOfKeys.get(kid)
        if (!privateKeyMaterial) {
          throw new Error(`Key material for kid ${kid} not found.`)
        }
        const hash = sha256Hash(message)
        const key = await privateKeyToHex(privateKeyMaterial)

        const signature = signSecp256k1(hash, key)
        const hexSignature = signatureToHex(signature)
        return hexToBase64Url(hexSignature)
      }
    }
    // Custom function that mimic a custom signer that would fetch the key material from the kid

    const signer = createSignerWithKid(privateKey.kid)
    // It would need to have kid context before being passed to signing
    // TODO: maybe signer take both the message and the key

    const jwt = await signJwt(payload, privateKey, { alg: SigningAlg.ES256K }, signer)
    const verified = await verifyJwt(jwt, privateKey)
    expect(verified.payload).toEqual(payload)
  })

  it('signs with default signer and specified algorithm', async () => {
    const privateKey = secp256k1PrivateKeyToJwk(`0x${UNSAFE_PRIVATE_KEY}`)
    const jwt = await signJwt(payload, privateKey, { alg: SigningAlg.EIP191 })
    const verified = await verifyJwt(jwt, privateKey)
    expect(verified.payload).toEqual(payload)
  })

  it('signs with default signer and no options provided', async () => {
    const privateKey = secp256k1PrivateKeyToJwk(`0x${UNSAFE_PRIVATE_KEY}`)
    const jwt = await signJwt(payload, privateKey)
    const verified = await verifyJwt(jwt, privateKey)
    expect(verified.payload).toEqual(payload)
  })

  it('throws if specified algorithm is not supported by the key', async () => {
    const privateKey = secp256k1PrivateKeyToJwk(`0x${UNSAFE_PRIVATE_KEY}`)
    await expect(signJwt(payload, privateKey, { alg: SigningAlg.ES256 })).rejects.toThrow()
  })

  it('throws if no signer is provided and key material is not present', async () => {
    const publicKey = secp256k1PublicKeyToJwk(`0x${UNSAFE_PRIVATE_KEY}`)
    await expect(signJwt(payload, publicKey)).rejects.toThrow()
  })
})
