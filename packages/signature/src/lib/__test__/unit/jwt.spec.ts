import { Action, Alg, Request } from '@narval/authz-shared'
import { decode } from '../../decode'
import { hashRequest } from '../../hash-request'
import { sign } from '../../sign'
import { SignatureInput, VerificationInput } from '../../types'
import { verify } from '../../verify'

describe('JWT lib', () => {
  const algorithm = Alg.ES256
  const kid = 'test-kid'
  const iat = 1734059225
  const exp = new Date('2024-12-12T00:00:00Z')
  const request: Request = {
    action: Action.CREATE_ORGANIZATION,
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
    }
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
      expect(jwt).toBe(decodedToken)
    })
  })

  describe('decode', () => {
    it('decodes a request successfully', async () => {
      const jwt = decode(signedToken)
      expect(jwt).toBe(decodedToken)
    })
  })
})
