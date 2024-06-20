import { Entities, EntityStore, Policy, PolicyStore } from '@narval/policy-engine-shared'
import axios from 'axios'
import { HEADER_CLIENT_ID, HEADER_CLIENT_SECRET } from '../constants'
import { DataStoreClientConfig } from '../domain'
import { ArmorySdkException } from '../exceptions'
import { signDataPayload } from '../sdk'
import { SetEntitiesResponse, SetPoliciesResponse } from '../types/data-store'
import { isSuccessResponse } from '../utils'

export const getEntities = async (entityStoreHost: string, clientSecret?: string): Promise<EntityStore> => {
  try {
    const headers = {
      ...(clientSecret && { [HEADER_CLIENT_SECRET]: clientSecret })
    }

    const {
      data: { entity }
    } = await axios.get(entityStoreHost, { headers })

    return entity
  } catch (error) {
    throw new ArmorySdkException('Failed to fetch entity store', { entityStoreHost, error })
  }
}

export const getPolicies = async (policyStoreHost: string, clientSecret?: string): Promise<PolicyStore> => {
  try {
    const headers = {
      ...(clientSecret && { [HEADER_CLIENT_SECRET]: clientSecret })
    }

    const {
      data: { policy }
    } = await axios.get(policyStoreHost, { headers })

    return policy
  } catch (error) {
    throw new ArmorySdkException('Failed to fetch policy store', { policyStoreHost, error })
  }
}

export const setEntities = async (config: DataStoreClientConfig, data: Entities): Promise<SetEntitiesResponse> => {
  try {
    const { dataStoreClientId: clientId, entityStoreHost, ...payload } = config

    const signature = await signDataPayload({ clientId, ...payload }, data)
    const entity = EntityStore.parse({ data, signature })
    const response = await axios.post<SetEntitiesResponse>(entityStoreHost, entity, {
      headers: {
        [HEADER_CLIENT_ID]: clientId
      }
    })

    if (!isSuccessResponse(response.status)) {
      throw new ArmorySdkException('Failed to set entities', {
        config,
        data,
        response
      })
    }

    return response.data
  } catch (error) {
    throw new ArmorySdkException('Failed to set entities', {
      config,
      data,
      error
    })
  }
}

export const setPolicies = async (config: DataStoreClientConfig, data: Policy[]): Promise<SetPoliciesResponse> => {
  try {
    const { dataStoreClientId: clientId, policyStoreHost, ...payload } = config

    const signature = await signDataPayload({ clientId, ...payload }, data)
    const policy = PolicyStore.parse({ data, signature })
    const response = await axios.post<SetPoliciesResponse>(policyStoreHost, policy, {
      headers: {
        [HEADER_CLIENT_ID]: clientId
      }
    })

    if (!isSuccessResponse(response.status)) {
      throw new ArmorySdkException('Failed to set policies', {
        config,
        data,
        response
      })
    }

    return response.data
  } catch (error) {
    throw new ArmorySdkException('Failed to set policies', {
      config,
      data,
      error
    })
  }
}
