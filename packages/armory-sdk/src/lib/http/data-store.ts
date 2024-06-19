import { Entities, EntityStore, Policy, PolicyStore } from '@narval/policy-engine-shared'
import axios from 'axios'
import { HEADER_CLIENT_ID, HEADER_CLIENT_SECRET } from '../constants'
import { DataStoreClientConfig } from '../domain'
import { ArmorySdkException } from '../exceptions'
import { signDataPayload } from '../sdk'
import { SetEntitiesResponse, SetPoliciesResponse } from '../types/data-store'
import { isSuccessResponse } from '../utils'

export const getEntities = async (config: DataStoreClientConfig): Promise<EntityStore> => {
  try {
    const {
      data: { entity }
    } = await axios.get(config.entityStoreHost, {
      headers: {
        [HEADER_CLIENT_SECRET]: config.dataStoreClientSecret
      }
    })

    return entity
  } catch (error) {
    throw new ArmorySdkException('Failed to fetch entity store', { config, error })
  }
}

export const getPolicies = async (config: DataStoreClientConfig): Promise<PolicyStore> => {
  try {
    const {
      data: { policy }
    } = await axios.get(config.policyStoreHost, {
      headers: {
        [HEADER_CLIENT_SECRET]: config.dataStoreClientSecret
      }
    })

    return policy
  } catch (error) {
    throw new ArmorySdkException('Failed to fetch policy store', { config, error })
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
