import { secp256k1 } from '@noble/curves/secp256k1'
import { sha256 as sha256Hash } from '@noble/hashes/sha256'
import { exportJWK, importPKCS8, jwtVerify } from 'jose'
import { createPublicKey } from 'node:crypto'
import { toHex, verifyMessage } from 'viem'
import { privateKeyToAccount, signMessage } from 'viem/accounts'
import { buildSignerEip191, buildSignerEs256k, signJwt } from '../../sign'
import { Alg, JWK, Payload, SigningAlg } from '../../types'
import { base64UrlToBytes, base64UrlToHex, jwkToPrivateKey, jwkToPublicKey, privateKeyToJwk, publicKeyToJwk } from '../../utils'
import { HEADER_PART, PAYLOAD_PART, PRIVATE_KEY_PEM } from './mock'
import { verifyJwt } from '../../verify'

describe('sign', () => {
  const ENGINE_PRIVATE_KEY = '7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

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

  it('should sign build & sign es256 JWT correctly with a PEM', async () => {
    const key = await importPKCS8(PRIVATE_KEY_PEM, Alg.ES256)
    const jwk = await exportJWK(key)
    const jwt = await signJwt(payload, { ...jwk, alg: Alg.ES256 } as JWK)

    const verified = await jwtVerify(jwt, key)
    expect(verified.payload).toEqual(payload)
  })

  it('should build & sign a EIP191 JWT', async () => {
    const jwk = privateKeyToJwk(`0x${ENGINE_PRIVATE_KEY}`)
    const signer = buildSignerEip191(ENGINE_PRIVATE_KEY)

    const jwt = await signJwt(
      payload,
      jwk,
      { alg: SigningAlg.EIP191 },
      signer
    )

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

  it('should sign ES256k correctly', async () => {
    const pubkey = secp256k1.getPublicKey(Buffer.from(ENGINE_PRIVATE_KEY, 'hex'), false)
    const message = [HEADER_PART, PAYLOAD_PART].join('.')
    const signer = buildSignerEs256k(ENGINE_PRIVATE_KEY)
    const signature = await signer(message)
    const msgHash = sha256Hash(message)

    const isVerified = secp256k1.verify(base64UrlToBytes(signature), msgHash, pubkey)
    expect(isVerified).toBe(true)

    expect(signature).toBe('FFI6M5oFpbQqq0-xhe5DgPVHj4CKoVF4F3K3cg1MRY1COqWatQNsSn2MrqJ10BbGLe7i76KRMDj4biqnZkxwsw')
  })

  it('should sign EIP191 correctly', async () => {
    const message = [HEADER_PART, PAYLOAD_PART].join('.')
    const signer = buildSignerEip191(ENGINE_PRIVATE_KEY)
    const signature = await signer(message)

    expect(signature).toBe('afu_-8eYXRpHAt_nTVRksRmiwVZpq7iC2rBVhGQT5YcJlViKV9wD3OIlRYAxa7JkNd1Yqzf_x2ohLzqGjmlb2hs')
  })

  it('should sign EIP191 the same as viem', async () => {
    // Just double-check that we're building a signature & base64url encoding the same thing we'd get from Viem.
    const message = [HEADER_PART, PAYLOAD_PART].join('.')
    const signer = buildSignerEip191(ENGINE_PRIVATE_KEY)
    const signature = await signer(message)

    const viemSig = await signMessage({
      message,
      privateKey: `0x${ENGINE_PRIVATE_KEY}`
    })

    const sigHex = base64UrlToHex(signature)

    expect(sigHex).toBe(viemSig)
  })

  it('should be able to verify an EIP191-signed JWT', async () => {
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
  it('should make keyobject', async () => {
    const publicKey = secp256k1.getPublicKey(ENGINE_PRIVATE_KEY, false)
    const viemPubKey = privateKeyToAccount(`0x${ENGINE_PRIVATE_KEY}`).publicKey
    expect(toHex(publicKey)).toBe(viemPubKey) // Confirm that our key is in fact the same as what viem would give.

    const jwk = privateKeyToJwk(`0x${ENGINE_PRIVATE_KEY}`)

    const k = await createPublicKey({
      format: 'jwk',
      key: jwk
    })

    expect(k).toBeDefined()
  })

  it('should convert to and from jwk', async () => {
    const jwk = privateKeyToJwk(`0x${ENGINE_PRIVATE_KEY}`)
    const pk = jwkToPrivateKey(jwk)
    expect(pk).toBe(`0x${ENGINE_PRIVATE_KEY}`)
  })

  it('should convert to and from public jwk', async () => {
    const publicKey = secp256k1.getPublicKey(ENGINE_PRIVATE_KEY, false)
    const jwk = publicKeyToJwk(toHex(publicKey))
    const pk = jwkToPublicKey(jwk)
    expect(pk).toBe(toHex(publicKey))
  })
})
