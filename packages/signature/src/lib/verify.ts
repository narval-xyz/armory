import { base64url, importSPKI, jwtVerify } from 'jose'
import { Hex, recoverMessageAddress } from 'viem'
import { isHex, publicKeyToAddress, toHex } from 'viem/utils'
import { decode } from './decode'
import { JwtError } from './error'
import { Jwt, Payload, VerificationInput } from './types'

const checkTokenValidity = (token: string): boolean => {
  const parts = token.split('.')
  return parts.length === 3
}

const eoaKeys = async (verificationInput: VerificationInput): Promise<Jwt> => {
  const { rawToken, publicKey } = verificationInput

  if (!checkTokenValidity(rawToken)) {
    throw new JwtError({ message: 'Invalid token', context: { rawToken } })
  }

  try {
    const parts = rawToken.split('.')

    const recoveredAddress = await recoverMessageAddress({
      message: `${parts[0]}.${parts[1]}`,
      signature: toHex(base64url.decode(parts[2]))
    })
    const pubKeyAddress = publicKeyToAddress(publicKey as Hex)

    if (pubKeyAddress !== recoveredAddress) {
      throw new JwtError({ message: 'Invalid signature', context: { rawToken } })
    }

    const token = decode(rawToken)

    const now = new Date()
    if (token.payload.exp && token.payload.exp < now) {
      throw new JwtError({ message: 'Token has expired', context: { rawToken } })
    }

    return decode(rawToken)
  } catch (e) {
    throw new JwtError({ message: 'error verifying eoa signature', context: { e } })
  }
}

/**
 * Verifies a JWT encoded and returns its payload.
 *
 * @param {VerificationInput} input - The input required to verify a JWT.
 * @returns {Promise<Jwt>} A promise that resolves with the JWT.
 * @throws {Error} If the JWT is invalid or the request hash does not match the request.
 */
export async function verify(input: VerificationInput): Promise<Jwt> {
  const { rawToken, publicKey } = input
  try {
    if (isHex(publicKey)) {
      return eoaKeys(input)
    }
    const jwt = decode(rawToken)
    const publicKeyObj = await importSPKI(publicKey, jwt.header.alg)
    await jwtVerify<Payload>(rawToken, publicKeyObj)

    return jwt
  } catch (error) {
    throw new JwtError({ message: 'Malformed token', context: { input, error } })
  }
}
