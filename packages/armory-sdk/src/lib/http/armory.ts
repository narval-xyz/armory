import { EvaluationRequest } from '@narval/policy-engine-shared'
import axios from 'axios'
import { HEADER_ADMIN_API_KEY, HEADER_CLIENT_ID } from '../constants'
import { AuthAdminConfig, AuthClientConfig } from '../domain'
import { ArmorySdkException } from '../exceptions'
import { signRequestPayload } from '../sdk'
import { AuthorizationRequest, OnboardArmoryClientRequest, OnboardArmoryClientResponse } from '../types/armory'
import { builBasicHeaders } from '../utils'

export const pingArmory = async (authHost: string): Promise<void> => {
  try {
    return axios.get(authHost)
  } catch (error) {
    throw new ArmorySdkException('Failed to ping auth server', { authHost, error })
  }
}

export const onboardArmoryClient = async (
  config: AuthAdminConfig,
  request: OnboardArmoryClientRequest
): Promise<OnboardArmoryClientResponse> => {
  const { authHost, authAdminApiKey } = config

  try {
    const { data } = await axios.post<OnboardArmoryClientResponse>(`${authHost}/clients`, request, {
      headers: {
        [HEADER_ADMIN_API_KEY]: authAdminApiKey
      }
    })

    return data
  } catch (error) {
    throw new ArmorySdkException('Failed to onboard client', { config, error })
  }
}

export const getAuthorizationRequest = async (config: AuthClientConfig, id: string): Promise<AuthorizationRequest> => {
  try {
    const { authHost, authClientId } = config

    const { data } = await axios.get<AuthorizationRequest>(`${authHost}/authorization-requests/${id}`, {
      headers: { [HEADER_CLIENT_ID]: authClientId }
    })

    return data
  } catch (error) {
    throw new ArmorySdkException('Failed to get authorization request', { config, error })
  }
}

export const sendAuthorizationRequest = async (
  config: AuthClientConfig,
  request: EvaluationRequest
): Promise<AuthorizationRequest> => {
  try {
    const { authHost, authClientId: clientId, jwk, alg, signer } = config

    const payload = await signRequestPayload({ clientId, jwk, alg, signer }, request)

    const { data } = await axios.post<AuthorizationRequest>(`${authHost}/authorization-requests`, payload, {
      headers: { [HEADER_CLIENT_ID]: clientId }
    })

    return data
  } catch (error) {
    throw new ArmorySdkException('Failed to send authorization request', { config, error })
  }
}

export const syncArmoryEngine = async (config: AuthClientConfig): Promise<{ latestSync: { success: boolean } }> => {
  try {
    const { authHost, authClientId: clientId, authClientSecret: clientSecret } = config

    if (!clientSecret) {
      throw new ArmorySdkException('Client secret is required to sync engine', { config })
    }

    const { data } = await axios.post<{ latestSync: { success: boolean } }>(`${authHost}/data/sync`, null, {
      headers: builBasicHeaders({ clientId, clientSecret })
    })

    return data
  } catch (error) {
    throw new ArmorySdkException('Failed to sync engine', { config, error })
  }
}
