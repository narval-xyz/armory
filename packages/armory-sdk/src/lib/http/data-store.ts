import { Entities, EntityStore, Policy, PolicyStore } from '@narval/policy-engine-shared'
import axios from 'axios'
import { EngineClientConfig } from '../domain'
import { NarvalSdkException } from '../exceptions'
import { signData } from '../sdk'
import { buildBasicEngineHeaders, isSuccessResponse } from '../utils'

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

export const setEntities = async (
  config: EngineClientConfig & { entityStoreHost: string },
  data: Entities
): Promise<{ success: boolean }> => {
  try {
    const headers = buildBasicEngineHeaders(config)
    const signature = await signData(config, data)
    const entity = EntityStore.parse({ data, signature })

    const response = await axios.post(config.entityStoreHost, entity, { headers })

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

export const setPolicies = async (
  config: EngineClientConfig & { policyStoreHost: string },
  data: Policy[]
): Promise<{ success: boolean }> => {
  try {
    const headers = buildBasicEngineHeaders(config)
    const signature = await signData(config, data)
    const policy = PolicyStore.parse({ data, signature })
    const response = await axios.post(config.policyStoreHost, policy, { headers })

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
