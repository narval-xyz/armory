import { importSPKI, jwtVerify } from 'jose'
import { Hex, recoverMessageAddress } from 'viem'
import { publicKeyToAddress } from 'viem/utils'
import { decode } from './decode'
import { JwtError } from './error'
import { hashRequest } from './hash-request'
import { Alg, Jwt, Payload, VerificationInput } from './types'

const isHex = (key: string | Hex): key is Hex => key.startsWith('0x') || key.startsWith('0X')

const checkTokenValidity = (token: string): boolean => {
  const parts = token.split('.')
  return parts.length === 3
}

const handleViemKey = async (signingInput: VerificationInput): Promise<Jwt> => {
  const { rawToken, request, publicKey } = signingInput

  if (!checkTokenValidity(rawToken)) {
    throw new JwtError({ message: 'Invalid token', context: { rawToken } })
  }

  if (!checkTokenValidity(rawToken)) {
    throw new JwtError({ message: 'Invalid token', context: { rawToken } })
  }

  const { signature } = decode(rawToken)

  // Use the original message for verification
  const message = hashRequest(request)

  // Recover the address from the signature
  const recoveredAddress = await recoverMessageAddress({
    message: message as Hex,
    signature: signature as Hex
  })

  const pubKeyAddress = publicKeyToAddress(publicKey as Hex)

  if (pubKeyAddress !== recoveredAddress) {
    throw new JwtError({ message: 'Invalid signature', context: { rawToken } })
  }

  return decode(rawToken)
}

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
    if (isHex(publicKey) && algorithm === Alg.ES256K) {
      return handleViemKey(input)
    }
    const publicKeyObj = await importSPKI(publicKey, algorithm)

    const { payload } = await jwtVerify<Payload>(rawToken, publicKeyObj, {
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
    const jwt = decode(rawToken)
    return jwt
  } catch (error) {
    throw new JwtError({ message: 'Malformed token', context: { input, error } })
  }
}
