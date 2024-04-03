import { decodeJwt } from '../../decode'
import { JwtError } from '../../error'
import { signJwt } from '../../sign'
import { privateKeyToJwk } from '../../utils'

describe('decodeJwt', () => {
  const payload = {
    requestHash: '68631bb22b171d296a522bb6c3248055597bf63eac2ba95f1fd02a48ae1edf8c',
    iat: 1733875200,
    exp: 1733961600
  }

  const key = privateKeyToJwk('0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5', 'ES256K')

  it('decodes a request successfully', async () => {
    const rawJwt = await signJwt(payload, key, { alg: 'ES256K' })

    const jwt = decodeJwt(rawJwt)
    expect(jwt).toEqual({
      header: {
        alg: 'ES256K',
        kid: key.kid,
        typ: 'JWT'
      },
      payload,
      signature: rawJwt.split('.')[2]
    })
  })

  it('throws an error if token is malformed', async () => {
    expect(() => decodeJwt('invalid')).toThrow(JwtError)
  })

  it('throws an error if token is in correct format but not valid base64url encoded data', async () => {
    expect(() => decodeJwt('invalid.invalid.invalid')).toThrow(JwtError)
  })
})
