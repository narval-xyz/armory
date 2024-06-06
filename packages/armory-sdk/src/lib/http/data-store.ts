import { Entities, EntityStore, Policy, PolicyStore } from '@narval/policy-engine-shared'
import axios from 'axios'
import { DataStoreClientConfig } from '../domain'
import { NarvalSdkException } from '../exceptions'
import { signDataPayload } from '../sdk'
import { builBasicHeaders, isSuccessResponse } from '../utils'

export const getEntities = async (entityStoreHost: string): Promise<EntityStore> => {
  try {
    const {
      data: { entity }
    } = await axios.get(entityStoreHost)

    return entity
  } catch (error) {
    throw new NarvalSdkException('Failed to fetch entity store', { entityStoreHost, error })
  }
}

export const getPolicies = async (policyStoreHost: string): Promise<PolicyStore> => {
  try {
    const {
      data: { policy }
    } = await axios.get(policyStoreHost)

    return policy
  } catch (error) {
    throw new NarvalSdkException('Failed to fetch policy store', { policyStoreHost, error })
  }
}

export const setEntities = async (config: DataStoreClientConfig, data: Entities): Promise<{ success: boolean }> => {
  try {
    const { dataStoreClientId: clientId, dataStoreClientSecret: clientSecret, entityStoreHost, ...payload } = config
    const headersPayload = { clientId, clientSecret, ...payload }

    const headers = builBasicHeaders(headersPayload)
    const signature = await signDataPayload(headersPayload, data)
    const entity = EntityStore.parse({ data, signature })
    const response = await axios.post(entityStoreHost, entity, { headers })

    if (!isSuccessResponse(response.status)) {
      throw new NarvalSdkException('Failed to set entities', {
        config,
        data,
        response
      })
    }

    return { success: true }
  } catch (error) {
    throw new NarvalSdkException('Failed to set entities', {
      config,
      data,
      error
    })
  }
}

export const setPolicies = async (config: DataStoreClientConfig, data: Policy[]): Promise<{ success: boolean }> => {
  try {
    const { dataStoreClientId: clientId, dataStoreClientSecret: clientSecret, policyStoreHost, ...payload } = config
    const headersPayload = { clientId, clientSecret, ...payload }

    const headers = builBasicHeaders(headersPayload)
    const signature = await signDataPayload(headersPayload, data)
    const policy = PolicyStore.parse({ data, signature })
    const response = await axios.post(policyStoreHost, policy, { headers })

    if (!isSuccessResponse(response.status)) {
      throw new NarvalSdkException('Failed to set policies', {
        config,
        data,
        response
      })
    }

    return { success: true }
  } catch (error) {
    throw new NarvalSdkException('Failed to set policies', {
      config,
      data,
      error
    })
  }
}
