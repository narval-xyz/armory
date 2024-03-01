import { SignJWT, base64url, importPKCS8 } from 'jose'
import { isHex, toBytes } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { JwtError } from './error'
import { hashRequest } from './hash-request'
import { Alg, SignatureInput } from './types'

const DEF_EXP_TIME = '2h'

const eoaKeys = async (signingInput: SignatureInput): Promise<string> => {
  const { request, privateKey, algorithm, kid, iat, exp } = signingInput

  if (!isHex(privateKey)) {
    throw new JwtError({ message: 'Invalid private key', context: { privateKey } })
  }

  const account = privateKeyToAccount(privateKey)
  const now = Math.floor(Date.now() / 1000)
  const iatNumeric = iat ? Math.floor(iat.getTime() / 1000) : now
  const expNumeric = exp ? Math.floor(exp.getTime() / 1000) : now + 2 * 60 * 60
  const header = { alg: algorithm, kid }
  const payload = {
    requestHash: hashRequest(request),
    iat: iatNumeric,
    exp: expNumeric
  }

  const encodedHeader = base64url.encode(JSON.stringify(header))
  const encodedPayload = base64url.encode(JSON.stringify(payload))

  const messageToSign = `${encodedHeader}.${encodedPayload}`
  const signature = await account.signMessage({ message: messageToSign })

  const completeJWT = `${messageToSign}.${base64url.encode(toBytes(signature))}`
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
      return eoaKeys(signingInput)
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
