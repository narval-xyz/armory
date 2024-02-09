import { importSPKI, jwtVerify } from 'jose'
import { hashRequest } from 'packages/authz-shared/src'
import { JwtError } from './error'
import { isHeader, isPayload } from './typeguards'
import { Jwt, Payload, VerificationInput } from './types'

/**
 * Verifies a JWT encoded and returns its payload.
 *
 * @param {VerificationInput} input - The input required to verify a JWT.
 * @returns {Promise<Jwt>} A promise that resolves with the JWT.
 * @throws {Error} If the JWT is invalid or the request hash does not match the request.
 */
export async function verify(input: VerificationInput): Promise<Jwt> {
  const { rawToken, request, algorithm, publicKey } = input
  try {
    const publicKeyObj = await importSPKI(publicKey, algorithm)

    const { payload, protectedHeader } = await jwtVerify<Payload>(rawToken, publicKeyObj, {
      algorithms: [algorithm]
    })

    const requestHash = hashRequest(request)
    if (payload.requestHash !== requestHash) {
      throw new JwtError({
        message: 'Request hash does not match the request',
        context: {
          payload,
          requestHash,
          input
        }
      })
    }

    if (!isHeader(protectedHeader)) {
      throw new JwtError({ message: 'Invalid header', context: { rawToken, payload, protectedHeader } })
    }
    if (!isPayload(payload)) {
      throw new JwtError({ message: 'Invalid payload', context: { rawToken, payload, protectedHeader } })
    }

    const jwt: Jwt = {
      header: {
        alg: protectedHeader.alg,
        kid: protectedHeader.kid
      },
      payload,
      signature: rawToken.split('.')[2]
    }
    return jwt
  } catch (error) {
    throw new JwtError({ message: 'Malformed token', context: { input, error } })
  }
}
