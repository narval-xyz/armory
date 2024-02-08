import { Action, Request, hashRequest } from '@narval/authz-shared'
import { exportPKCS8, exportSPKI, generateKeyPair } from 'jose'
import { sign } from '../../signature/signRequest'
import { verify } from '../../signature/verifySignature'
import { SignatureInput, VerificationInput } from '../../types'
import { AAUser, AAUser_Credential_1 } from '../mock'

describe('JWT Signing and Verification', () => {
  it('should sign and verify a request successfully', async () => {
    const request: Request = {
      action: Action.CREATE_ORGANIZATION,
      nonce: 'random-nonce-111',
      organization: {
        uid: AAUser.uid,
        credential: AAUser_Credential_1
      }
    }

    const algorithm = AAUser_Credential_1.alg
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

    console.log('Public Key PEM:', publicKeyPEM)

    const verificationInput: VerificationInput = {
      rawToken: jwt,
      publicKey: publicKeyPEM,
      request,
      algorithm,
      kid
    }

    const result = await verify(verificationInput)

    expect(result).toEqual({ requestHash: hash, iat: expect.any(Number), exp: expect.any(Number) })
  })
})
