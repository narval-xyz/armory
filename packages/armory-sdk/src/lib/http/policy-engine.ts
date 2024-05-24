import { EvaluationRequest, SerializedEvaluationRequest } from '@narval/policy-engine-shared'
import axios from 'axios'
import { HEADER_CLIENT_ID } from '../constants'
import { Endpoints, EngineClientConfig, SdkEvaluationResponse } from '../domain'
import { NarvalSdkException } from '../exceptions'
import { buildBasicEngineHeaders, signRequest } from '../utils'

export const pingEngine = async (config: EngineClientConfig): Promise<void> => {
  try {
    return axios.get(config.authHost)
  } catch (error) {
    throw new NarvalSdkException('Failed to ping engine', { config, error })
  }
}

export const sendEvaluationRequest = async (
  config: EngineClientConfig,
  request: EvaluationRequest
): Promise<SdkEvaluationResponse> => {
  try {
    const { authHost, authClientId } = config
    const body = await signRequest(config, request)
    const { data } = await axios.post<SdkEvaluationResponse>(
      `${authHost}${Endpoints.engine.evaluations}`,
      SerializedEvaluationRequest.parse(body),
      { headers: { [HEADER_CLIENT_ID]: authClientId } }
    )
    return SdkEvaluationResponse.parse(data)
  } catch (error) {
    throw new NarvalSdkException('Failed to evaluate request', { config, request, error })
  }
}

export const syncEngine = async (config: EngineClientConfig): Promise<boolean> => {
  try {
    const { authHost } = config
    const { data } = await axios.post(`${authHost}${Endpoints.engine.sync}`, null, {
      headers: buildBasicEngineHeaders(config)
    })

    return data.ok
  } catch (error) {
    throw new NarvalSdkException('Failed to sync engine', { config, error })
  }
}
