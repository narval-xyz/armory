import { Action, Alg, Request, hashRequest } from '@narval/authz-shared'
import { exportPKCS8, exportSPKI, generateKeyPair } from 'jose'
import { sign } from '../../sign'
import { SignatureInput, VerificationInput } from '../../types'
import { verify } from '../../verify'

describe('JWT Signing and Verification', () => {
  it('should sign and verify a request successfully', async () => {
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

    const algorithm = Alg.ES256
    const kid = 'test-kid'

    const { publicKey, privateKey } = await generateKeyPair(algorithm, { crv: 'P-256' })

    const privateKeyPEM = await exportPKCS8(privateKey)
    const publicKeyPEM = await exportSPKI(publicKey)

    const hash = hashRequest(request)

    const signingInput: SignatureInput = {
      request,
      privateKey: privateKeyPEM,
      algorithm,
      kid
    }

    const jwt = await sign(signingInput)

    const verificationInput: VerificationInput = {
      rawToken: jwt,
      publicKey: publicKeyPEM,
      request,
      algorithm,
      kid
    }

    const result = await verify(verificationInput)

    expect(result).toEqual({
      header: {
        alg: algorithm,
        kid
      },
      payload: {
        requestHash: hash,
        exp: expect.any(Number),
        iat: expect.any(Number)
      },
      signature: expect.any(String)
    })
  })
})
