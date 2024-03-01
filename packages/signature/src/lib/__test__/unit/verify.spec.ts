import { VerificationInput } from '../../types'
import { verify } from '../../verify'
import { DECODED_TOKEN, PUBLIC_KEY_PEM, SIGNED_TOKEN } from './mock'

describe('verify', () => {
  it('verifies a request successfully', async () => {
    const verificationInput: VerificationInput = {
      rawToken: SIGNED_TOKEN,
      publicKey: PUBLIC_KEY_PEM
    }
    const jwt = await verify(verificationInput)
    expect(jwt).toEqual(DECODED_TOKEN)
  })
})
