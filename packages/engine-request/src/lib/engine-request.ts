import { EvaluationRequest, EvaluationResponse, JwtString, Request } from '@narval/policy-engine-shared'
import { Jwk, Payload, SigningAlg, hash, signJwt } from '@narval/signature'
import axios from 'axios'

export type SignConfig = {
  principalCredential: Jwk
  orgId: string
  signingAlg?: SigningAlg
  signer?: (payload: string) => Promise<string>
}

export type BuildEngineRequestInput = {
  request: Request
  signingConfig: SignConfig
}

const buildPayloadFromRequest = (request: Request, jwk: Jwk, orgId: string): Payload => {
  return {
    requestHash: hash(request),
    sub: jwk.kid,
    iss: orgId,
    iat: new Date().getTime()
  }
}

export const signPayload = async ({ payload, jwk }: { payload: Payload; jwk: Jwk }): Promise<JwtString> => {
  const jwt = await signJwt(payload, jwk)
  return jwt
}

export const signPayloadSafe = async ({
  payload,
  jwk
}: {
  payload: Payload
  jwk: Jwk
}): Promise<{ success: boolean; jwt: JwtString | null; error?: unknown }> => {
  try {
    const jwt = await signJwt(payload, jwk)
    return { success: true, jwt }
  } catch (error) {
    return { success: false, jwt: null, error }
  }
}

export const signEngineRequest = async ({ request, signingConfig }: BuildEngineRequestInput): Promise<JwtString> => {
  const { principalCredential, signingAlg, signer } = signingConfig
  const payload = buildPayloadFromRequest(request, principalCredential, signingConfig.orgId)
  const authentication = signer
    ? await signJwt(payload, principalCredential, { alg: signingAlg }, signer)
    : await signJwt(payload, principalCredential, { alg: signingAlg })
  return authentication
}

export const signEngineRequestSafe = async ({
  request,
  signingConfig
}: BuildEngineRequestInput): Promise<{ success: boolean; jwt: JwtString | null; error?: unknown }> => {
  try {
    const authentication = await signEngineRequest({ request, signingConfig })
    return { success: true, jwt: authentication }
  } catch (error) {
    return { success: false, jwt: null, error }
  }
}

export const sendEvaluationRequest = async (
  evaluationRequest: EvaluationRequest,
  engineUrl: string
): Promise<EvaluationResponse> => {
  const response = await axios.post<EvaluationResponse>(engineUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(evaluationRequest)
  })
  return response.data
}
