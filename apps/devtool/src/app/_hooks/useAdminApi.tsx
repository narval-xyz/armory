import { Entities, EvaluationResponse, Policy } from '@narval/policy-engine-shared'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { extractErrorMessage } from '../_lib/utils'
import example from './example.json'
import useStore from './useStore'

type DataStore = { entity: Entities; policy: Policy[] }

const useAdminApi = () => {
  const { engineClientId, engineClientSecret, entityDataStoreUrl, policyDataStoreUrl } = useStore()
  const [dataStore, setDataStore] = useState<DataStore>()
  const [isEntitySigning, setIsEntitySigning] = useState(false)
  const [isPolicySigning, setIsPolicySigning] = useState(false)
  const [errors, setErrors] = useState<any>()

  useEffect(() => {
    if (!dataStore) {
      getDataStore()
    }
  }, [dataStore])

  const getDataStore = async () => {
    if (!entityDataStoreUrl || !policyDataStoreUrl) return

    try {
      const headers = { 'x-org-id': '1' }
      const [{ data: entity }, { data: policy }] = await Promise.all([
        axios.get<Entities>(entityDataStoreUrl, { headers }),
        axios.get<Policy[]>(policyDataStoreUrl, { headers })
      ])

      if (!entity && !policy) {
        const data = example as unknown as DataStore
        setDataStore(data)
        return data
      }

      const data: DataStore = { entity, policy }
      setDataStore(data)
      return data
    } catch (error) {
      setDataStore(example as unknown as DataStore)
    }
  }

  const setEntities = async (entities: Entities) => {
    if (!engineClientId || !engineClientSecret || !entityDataStoreUrl) return

    setErrors(undefined)
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

  const setPolicies = async (policies: Policy[]) => {
    if (!engineClientId || !engineClientSecret || !policyDataStoreUrl) return

    setErrors(undefined)
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

  return { dataStore, isEntitySigning, isPolicySigning, errors, setEntities, setPolicies }
}

export default useAdminApi
