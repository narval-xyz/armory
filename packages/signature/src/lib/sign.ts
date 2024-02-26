import { SignJWT, base64url, importPKCS8 } from 'jose'
import { Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { JwtError } from './error'
import { hashRequest } from './hash-request'
import { Alg, SignatureInput } from './types'

const DEF_EXP_TIME = '2h'

const isHex = (key: string | Hex): key is Hex => key.startsWith('0x') || key.startsWith('0X')

const handleViemKey = async (signingInput: SignatureInput): Promise<string> => {
  const { request, privateKey, algorithm, kid, iat, exp } = signingInput

  if (!isHex(privateKey)) {
    throw new JwtError({ message: 'Invalid private key', context: { privateKey } })
  }

  const account = privateKeyToAccount(privateKey)

  const encodedHeader = base64url.encode(JSON.stringify({ alg: algorithm, kid }))
  const hashedRequest = hashRequest(request)
  const encodedPayload = base64url.encode(JSON.stringify({ requestHash: hashedRequest, iat, exp }))

  const signature = await account.signMessage({ message: hashedRequest })

  const completeJWT = `${encodedHeader}.${encodedPayload}.${signature}`
  return completeJWT
}

/**
 * Signs a request using the provided private key and algorithm.
 *
 * @param {SignatureInput} signingInput - The input required to sign a request.
 * @returns {Promise<string>} A promise that resolves with the signed JWT.
 */
export async function sign(signingInput: SignatureInput): Promise<string> {
  const { request, privateKey: pk, algorithm, kid, iat, exp } = signingInput

  try {
    if (isHex(pk) && algorithm === Alg.ES256K) {
      return handleViemKey(signingInput)
    }
    const privateKey = await importPKCS8(pk, algorithm)
    const requestHash = hashRequest(request)

    const jwt = await new SignJWT({ requestHash })
      .setProtectedHeader({ alg: algorithm, kid })
      .setIssuedAt(iat)
      .setExpirationTime(exp || DEF_EXP_TIME)
      .sign(privateKey)
    return jwt
  } catch (error) {
    throw new JwtError({ message: 'Failed to sign request.', context: { error } })
  }
}
