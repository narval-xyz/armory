import { Alg, PrivateKey, generateJwk, getPublicKey, hash, signJwt } from '@narval/signature'
import { Action } from '../../../type/action.type'
import { ConfirmationClaimProofMethod, Request } from '../../../type/domain.type'
import { verifyConfirmationClaimProofOfPossession } from '../../confirmation-claim.util'

const bindPrivateKey: PrivateKey = {
  kty: 'OKP',
  crv: 'Ed25519',
  alg: 'EDDSA',
  kid: '0x65a3f312d1fc34e937ca9c1b7fbe5b9f98fb15e2cb15594ec6cd5167e36a58e3',
  x: 'n0AX7pAzBhCr6R7dRhPqeGDVIKRaatVjdmL3KX58HGw',
  d: 'tl8nZiFTRa5C_yJvL73KFnxDbuUi8h6bUvh28jvXmII'
}

const request: Request = {
  action: Action.SIGN_MESSAGE,
  nonce: '123',
  message: 'sign me',
  resourceId: 'test-resource-id'
}

describe('verifyConfirmationClaimProofOfPossession', () => {
  it('verifies valid proof of possession', async () => {
    const result = await verifyConfirmationClaimProofOfPossession({
      authentication: '',
      request,
      metadata: {
        confirmation: {
          key: {
            jwk: getPublicKey(bindPrivateKey),
            proof: ConfirmationClaimProofMethod.JWS,
            jws: await signJwt(
              {
                requestHash: hash(request)
              },
              bindPrivateKey
            )
          }
        }
      }
    })

    expect(result).toBe(true)
  })

  it('returns true when no proof method is specified', async () => {
    const result = await verifyConfirmationClaimProofOfPossession({
      authentication: '',
      request,
      metadata: {
        confirmation: {
          key: {
            jwk: getPublicKey(bindPrivateKey)
          }
        }
      }
    })

    expect(result).toBe(true)
  })

  it('throws error when proof method is specified but jws is missing', async () => {
    await expect(
      verifyConfirmationClaimProofOfPossession({
        authentication: '',
        request,
        metadata: {
          confirmation: {
            key: {
              jwk: getPublicKey(bindPrivateKey),
              proof: ConfirmationClaimProofMethod.JWS
            }
          }
        }
      })
    ).rejects.toThrow('Missing confirmation claim jws')
  })

  it('throws error when hash mismatch', async () => {
    await expect(
      verifyConfirmationClaimProofOfPossession({
        authentication: '',
        // Source request.
        request,
        metadata: {
          confirmation: {
            key: {
              jwk: getPublicKey(bindPrivateKey),
              proof: ConfirmationClaimProofMethod.JWS,
              jws: await signJwt(
                {
                  // Tampered request.
                  requestHash: hash({
                    ...request,
                    nonce: 'modified-nonce'
                  })
                },
                bindPrivateKey
              )
            }
          }
        }
      })
    ).rejects.toThrow('Confirmation claim jws hash mismatch')
  })

  it('throws error when JWT verification fails', async () => {
    await expect(
      verifyConfirmationClaimProofOfPossession({
        authentication: '',
        request,
        metadata: {
          confirmation: {
            key: {
              jwk: getPublicKey(bindPrivateKey),
              proof: ConfirmationClaimProofMethod.JWS,
              jws: await signJwt(
                {
                  requestHash: hash(request)
                },
                await generateJwk(Alg.EDDSA)
              )
            }
          }
        }
      })
    ).rejects.toThrow('Invalid confirmation claim jws')
  })
})
