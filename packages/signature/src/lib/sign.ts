import { SignJWT, importPKCS8 } from 'jose'
import { decode } from './decode'
import { hashRequest } from './hash-request'
import { Jwt, SignatureInput } from './types'

const DEF_EXP_TIME = '2h'

/**
 * Signs a request using the provided private key and algorithm.
 *
 * @param {SignatureInput} signingInput - The input required to sign a request.
 * @returns {Promise<string>} A promise that resolves with the signed JWT.
 */
export async function sign(signingInput: SignatureInput): Promise<string> {
  const { request, privateKey, algorithm, kid, iat, exp } = signingInput

  const requestHash = hashRequest(request)
  const privateKeyObj = await importPKCS8(privateKey, algorithm)

  const jwt = await new SignJWT({ requestHash })
    .setProtectedHeader({ alg: algorithm, kid })
    .setIssuedAt(iat)
    .setExpirationTime(exp || DEF_EXP_TIME)
    .sign(privateKeyObj)
  return jwt
}

/**
 * Signs a request using the provided private key and algorithm.
 * Returns the parsed JWT.
 *
 * @param {SignatureInput} signingInput - The input required to sign a request.
 * @returns {Promise<Jwt>} A promise that resolves with the parsed JWT.
 *
 */
export async function signAndParse(signingInput: SignatureInput): Promise<Jwt> {
  const token = await sign(signingInput)
  const jwt = decode(token)
  return jwt
}
