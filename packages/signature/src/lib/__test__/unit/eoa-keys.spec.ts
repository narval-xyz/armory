import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { sign } from '../../sign'
import { Alg, SignatureInput, VerificationInput } from '../../types'
import { verify } from '../../verify'
import { DECODED_TOKEN, EXP, IAT, KID, REQUEST } from './mock'

describe('flow with viem keypairs', () => {
  it('should sign and verify a request successfully', async () => {
    const viemPkAlg = Alg.ES256K
    const pk = generatePrivateKey()
    const { publicKey: viemPk } = privateKeyToAccount(pk)
    const expected = {
      header: {
        ...DECODED_TOKEN.header,
        alg: viemPkAlg
      },
      payload: DECODED_TOKEN.payload,
      signature: expect.any(String)
    }
    const signingInput: SignatureInput = {
      request: REQUEST,
      privateKey: pk,
      algorithm: viemPkAlg,
      kid: KID,
      iat: IAT,
      exp: EXP
    }
    const jwt = await sign(signingInput)
    const verificationInput: VerificationInput = {
      rawToken: jwt,
      publicKey: viemPk
    }
    const verifiedJwt = await verify(verificationInput)
    expect(verifiedJwt).toEqual(expected)
  })
})
