import { Action, Alg, Request, hashRequest } from '@narval/authz-shared'
import { exportPKCS8, exportSPKI, generateKeyPair } from 'jose'
import { decode } from '../../decode'
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
      algorithm
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

describe('Multisignature example', () => {
  it('handles multisig scenario with sign, verify, and decode', async () => {
    // Simulate a request that requires multisignature
    const request: Request = {
      action: Action.CREATE_ORGANIZATION,
      nonce: 'multisig-nonce-123',
      organization: {
        uid: 'multisig-org-uid',
        credential: {
          uid: 'multisig-credential-uid',
          pubKey: 'multisig-pub-key',
          alg: Alg.ES256,
          userId: 'multisig-user-id'
        }
      }
    }

    const algorithm = Alg.ES256
    const clientIds = ['client1-kid', 'client2-kid']

    // Generate key pairs for each client
    const keyPairs = await Promise.all(
      clientIds.map(async (kid) => {
        const { publicKey, privateKey } = await generateKeyPair('ES256')
        return {
          kid,
          publicKey: await exportSPKI(publicKey),
          privateKey: await exportPKCS8(privateKey)
        }
      })
    )

    // Each client signs the request
    const signedJwts = await Promise.all(
      keyPairs.map(({ kid, privateKey }) => {
        const signingInput: SignatureInput = {
          request,
          privateKey,
          algorithm,
          kid
        }
        return sign(signingInput)
      })
    )

    console.log('signedJwts', signedJwts)
    // Decode and verify each JWT
    const decodedVerifiedJwts = await Promise.all(
      signedJwts.map(async (jwt, index) => {
        const { publicKey } = keyPairs[index]
        const decodedJwt = decode(jwt)
        const verificationInput: VerificationInput = {
          rawToken: jwt,
          publicKey,
          request,
          algorithm
        }
        await verify(verificationInput) // Assuming verification throws if invalid
        return decodedJwt
      })
    )

    // Check that each decoded JWT contains the expected request hash
    const requestHash = hashRequest(request)
    decodedVerifiedJwts.forEach((decodedJwt) => {
      expect(decodedJwt.requestHash).toBe(requestHash)
    })
  })
})
