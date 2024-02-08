import { hashRequest } from '@narval/authz-shared'
import { SignJWT, importPKCS8 } from 'jose'
import { SignatureInput } from './types'

const DEF_EXP_TIME = '2h'

/**
 * Signs a request using the provided private key and algorithm.
 *
 * @param {SignatureInput} signingInput - The input required to sign a request.
 * @returns {Promise<string>} A promise that resolves with the signed JWT.
 */
export async function sign(signingInput: SignatureInput): Promise<string> {
  const { request, privateKey, algorithm, kid } = signingInput

  const requestHash = hashRequest(request)
  const privateKeyObj = await importPKCS8(privateKey, algorithm)

  const jwt = await new SignJWT({ requestHash })
    .setProtectedHeader({ alg: algorithm, kid })
    .setIssuedAt()
    .setExpirationTime(DEF_EXP_TIME)
    .sign(privateKeyObj)

  return jwt
}
