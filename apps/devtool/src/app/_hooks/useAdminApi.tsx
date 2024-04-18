import {
  Entities,
  EntityStore,
  EntityUtil,
  EvaluationResponse,
  FIXTURE,
  Policy,
  PolicyStore,
  entityDataSchema,
  policyDataSchema
} from '@narval/policy-engine-shared'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { extractErrorMessage } from '../_lib/utils'
import useStore from './useStore'

type DataStore = { entity: Entities; policy: Policy[] }

const initDataStore: DataStore = {
  entity: FIXTURE.ENTITIES,
  policy: FIXTURE.POLICIES
}

const useAdminApi = () => {
  const {
    engineClientId,
    engineClientSecret,
    entityDataStoreUrl,
    policyDataStoreUrl,
    entityDataStoreHeaders,
    policyDataStoreHeaders
  } = useStore()
  const [dataStore, setDataStore] = useState<DataStore>()
  const [isEntitySigning, setIsEntitySigning] = useState(false)
  const [isPolicySigning, setIsPolicySigning] = useState(false)
  const [errors, setErrors] = useState<string>()

  useEffect(() => {
    if (!dataStore) {
      getDataStore()
    }
  }, [dataStore])

  const getDataStore = async () => {
    if (!entityDataStoreUrl || !policyDataStoreUrl) return

    let data = initDataStore

    try {
      const [{ data: entityData }, { data: policyData }] = await Promise.all([
        axios.get<{ entity: EntityStore }>(entityDataStoreUrl, { headers: JSON.parse(entityDataStoreHeaders) }),
        axios.get<{ policy: PolicyStore }>(policyDataStoreUrl, { headers: JSON.parse(policyDataStoreHeaders) })
      ])

      if (entityData?.entity?.data || policyData?.policy?.data) {
        data = { entity: entityData.entity.data, policy: policyData.policy.data }
      }
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setDataStore(data)
    return data
  }

  const signEntityDataStore = async (entities: Entities) => {
    if (!engineClientId || !engineClientSecret || !entityDataStoreUrl) return

    setErrors(undefined)

    const entityValidationResult = entityDataSchema.safeParse({ entity: { data: entities } })

    if (!entityValidationResult.success) {
      setErrors(
        entityValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`).join(', ')
      )
      return
    }

    const validation = EntityUtil.validate(entities)

    if (!validation.success) {
      setErrors(validation.issues.map((issue) => issue.message).join(', '))
      return
    }

    setIsEntitySigning(true)

    try {
      await axios.post<EvaluationResponse>(entityDataStoreUrl, entities, {
        headers: {
          'x-org-id': '1',
          'x-client-id': engineClientId,
          'x-client-secret': engineClientSecret
        }
      })
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setIsEntitySigning(false)
  }

  const signPolicyDataStore = async (policies: Policy[]) => {
    if (!engineClientId || !engineClientSecret || !policyDataStoreUrl) return

    setErrors(undefined)

    const policyValidationResult = policyDataSchema.safeParse({ policy: { data: policies } })

    if (!policyValidationResult.success) {
      setErrors(
        policyValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`).join(', ')
      )
      return
    }

    setIsPolicySigning(true)

    try {
      await axios.post<EvaluationResponse>(policyDataStoreUrl, policies, {
        headers: {
          'x-org-id': '1',
          'x-client-id': engineClientId,
          'x-client-secret': engineClientSecret
        }
      })
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setIsPolicySigning(false)
  }

  return { dataStore, isEntitySigning, isPolicySigning, errors, signEntityDataStore, signPolicyDataStore }
}

export default useAdminApi
