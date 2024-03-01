import { sign } from '../../sign'
import { SignatureInput } from '../../types'
import { ALGORITHM, EXP, HEADER_PART, IAT, KID, PAYLOAD_PART, PRIVATE_KEY_PEM, REQUEST } from './mock'

describe('sign', () => {
  it('signs a request successfully', async () => {
    const signingInput: SignatureInput = {
      request: REQUEST,
      privateKey: PRIVATE_KEY_PEM,
      algorithm: ALGORITHM,
      kid: KID,
      iat: IAT,
      exp: EXP
    }
    const jwt = await sign(signingInput)
    const parts = jwt.split('.')
    expect(parts.length).toBe(3)
    expect(parts[0]).toBe(HEADER_PART)
    expect(parts[1]).toBe(PAYLOAD_PART)
  })
})
