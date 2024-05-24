import { EvaluationRequest } from '@narval/policy-engine-shared'
import axios from 'axios'
import { HEADER_CLIENT_ID } from '../constants'
import { AuthorizationRequest, Endpoints, EngineClientConfig } from '../domain'
import { NarvalSdkException } from '../exceptions'
import { signRequest } from '../utils'

export const getAuthorizationRequest = async (
  config: EngineClientConfig,
  id: string
): Promise<AuthorizationRequest> => {
  try {
    const { authHost, authClientId } = config
    const uri = `${authHost}${Endpoints.armory.authorizeRequest}/${id}`
    const headers = { [HEADER_CLIENT_ID]: authClientId }
    const { data } = await axios.get(uri, { headers })

    return AuthorizationRequest.parse(data)
  } catch (error) {
    throw new NarvalSdkException('Failed to get authorization request', { config, id, error })
  }
}

export const sendAuthorizationRequest = async (
  config: EngineClientConfig,
  request: EvaluationRequest
): Promise<AuthorizationRequest> => {
  try {
    const { authHost, authClientId } = config
    const uri = `${authHost}${Endpoints.armory.authorizeRequest}`
    const headers = { [HEADER_CLIENT_ID]: authClientId }
    const payload = await signRequest(config, request)
    const { data } = await axios.post(uri, payload, { headers })

    return AuthorizationRequest.parse(data)
  } catch (error) {
    throw new NarvalSdkException('Failed to send authorization request', { config, request, error })
  }
}
