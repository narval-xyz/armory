import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { decode } from '../../decode'
import { hashRequest } from '../../hash-request'
import { sign } from '../../sign'
import { isHeader, isPayload } from '../../typeguards'
import { Alg, SignatureInput, VerificationInput } from '../../types'
import { verify } from '../../verify'

describe('JWT lib', () => {
  const algorithm = Alg.ES256
  const kid = 'test-kid'
  const iat = 1734059225
  const exp = new Date('2024-12-12T00:00:00Z')
  const request = {
    action: 'CREATE_ORGANIZATION',
    nonce: 'random-nonce-111',
    organization: {
      uid: 'test-org-uid',
      credential: {
        uid: 'test-credential-uid',
        pubKey: 'test-pub-key',
        alg: Alg.ES256,
        userId: 'test-user-id'
      }
    }
  }
  const publicKeyPEM = `-----BEGIN PUBLIC KEY-----
  MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE+ByvT640j9s+bBVc1PjTlOiZa9ox
  yuesKMatcDb0gIeCWbWDuEiyVmkgfGFA93Gl6oB94EiB2EFpvhGNoeJwHA==
  -----END PUBLIC KEY-----`
  const privateKeyPEM = `-----BEGIN PRIVATE KEY-----
  MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgUDs3iCP93sknEZ+c
  DcdsS+UdaUgKK0XVajrBWZbQYWehRANCAAT4HK9PrjSP2z5sFVzU+NOU6Jlr2jHK
  56woxq1wNvSAh4JZtYO4SLJWaSB8YUD3caXqgH3gSIHYQWm+EY2h4nAc
  -----END PRIVATE KEY-----`
  const hash = hashRequest(request)
  const signedToken =
    'eyJhbGciOiJFUzI1NiIsImtpZCI6InRlc3Qta2lkIn0.eyJyZXF1ZXN0SGFzaCI6IjY4NjMxYmIyMmIxNzFkMjk2YTUyMmJiNmMzMjQ4MDU1NTk3YmY2M2VhYzJiYTk1ZjFmZDAyYTQ4YWUxZWRmOGMiLCJpYXQiOjE3MzQwNTkyMjUsImV4cCI6MTczMzk2MTYwMH0.VWnanCpWdWtRru-zfeGshK_sS2m5vciHUXkmH7lpSmYA2pqh-oa3f4b9FHohpCCYD7nJR6_lOGO9ef7Eaxmdkw'
  const headerPart = 'eyJhbGciOiJFUzI1NiIsImtpZCI6InRlc3Qta2lkIn0'
  const payloadPart =
    'eyJyZXF1ZXN0SGFzaCI6IjY4NjMxYmIyMmIxNzFkMjk2YTUyMmJiNmMzMjQ4MDU1NTk3YmY2M2VhYzJiYTk1ZjFmZDAyYTQ4YWUxZWRmOGMiLCJpYXQiOjE3MzQwNTkyMjUsImV4cCI6MTczMzk2MTYwMH0'
  const decodedToken = {
    header: {
      alg: 'ES256',
      kid: 'test-kid'
    },
    payload: {
      requestHash: hash,
      iat,
      exp: 1733961600
    },
    signature: 'VWnanCpWdWtRru-zfeGshK_sS2m5vciHUXkmH7lpSmYA2pqh-oa3f4b9FHohpCCYD7nJR6_lOGO9ef7Eaxmdkw'
  }

  describe('sign', () => {
    it('signs a request successfully', async () => {
      const signingInput: SignatureInput = {
        request,
        privateKey: privateKeyPEM,
        algorithm,
        kid,
        iat,
        exp
      }
      const jwt = await sign(signingInput)
      const parts = jwt.split('.')
      expect(parts.length).toBe(3)
      expect(parts[0]).toBe(headerPart)
      expect(parts[1]).toBe(payloadPart)
    })
  })

  describe('verify', () => {
    it('verifies a request successfully', async () => {
      const verificationInput: VerificationInput = {
        request,
        rawToken: signedToken,
        publicKey: publicKeyPEM,
        algorithm
      }
      const jwt = await verify(verificationInput)
      expect(jwt).toEqual(decodedToken)
    })
  })

  describe('decode', () => {
    it('decodes a request successfully', async () => {
      const jwt = decode(signedToken)
      expect(jwt).toEqual(decodedToken)
    })
  })

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
      const validPayload = { requestHash: 'hash', iat: 123456 }
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

  describe('flow with viem keypairs', () => {
    it('should sign and verify a request successfully', async () => {
      const viemPkAlg = Alg.ES256K
      const pk = generatePrivateKey()
      const { publicKey: viemPk } = privateKeyToAccount(pk)
      const expected = {
        header: {
          ...decodedToken.header,
          alg: viemPkAlg
        },
        payload: {
          ...decodedToken.payload,
          exp: '2024-12-12T00:00:00.000Z'
        },
        signature: expect.any(String)
      }
      const signingInput: SignatureInput = {
        request,
        privateKey: pk,
        algorithm: viemPkAlg,
        kid,
        iat,
        exp
      }
      const jwt = await sign(signingInput)
      const verificationInput: VerificationInput = {
        request,
        rawToken: jwt,
        publicKey: viemPk,
        algorithm: viemPkAlg
      }
      const verifiedJwt = await verify(verificationInput)
      expect(verifiedJwt).toEqual(expected)
    })
  })
})
