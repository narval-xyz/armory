import { VerificationInput } from '../../types'
import { verify } from '../../verify'
import { ALGORITHM, DECODED_TOKEN, PUBLIC_KEY_PEM, REQUEST, SIGNED_TOKEN } from './mock'

describe('verify', () => {
  it('verifies a request successfully', async () => {
    const verificationInput: VerificationInput = {
      request: REQUEST,
      rawToken: SIGNED_TOKEN,
      publicKey: PUBLIC_KEY_PEM,
      algorithm: ALGORITHM
    }
    const jwt = await verify(verificationInput)
    expect(jwt).toEqual(DECODED_TOKEN)
  })
})
