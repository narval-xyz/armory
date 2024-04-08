import {
  Entities,
  EntityStore,
  EntityUtil,
  Policy,
  PolicyStore,
  entityDataSchema,
  policyDataSchema
} from '@narval/policy-engine-shared'
import { Payload, hash } from '@narval/signature'
import axios from 'axios'
import { useEffect, useState } from 'react'
import useAccountSignature from './useAccountSignature'

type DataStore = { entity: EntityStore; policy: PolicyStore }

const useDataStoreApi = () => {
  const { jwk, signAccountJwt } = useAccountSignature()

  const [dataStore, setDataStore] = useState<DataStore>()
  const [isEntitySigning, setIsEntitySigning] = useState(false)
  const [isPolicySigning, setIsPolicySigning] = useState(false)
  const [errors, setErrors] = useState<unknown>()

  useEffect(() => {
    if (!dataStore) {
      getDataStore()
    }
  }, [dataStore])

  const getDataStore = async () => {
    const { data } = await axios.get<DataStore>('/api/data-store')
    setDataStore(data)

    return data
  }

  const signEntityDataStore = async (entity: Entities) => {
    if (!jwk || !dataStore) return

    setErrors(undefined)

    const entityValidationResult = entityDataSchema.safeParse({ entity: { data: entity } })

    if (!entityValidationResult.success) {
      setErrors(entityValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`))
      return
    }

    const validation = EntityUtil.validate(entity)

    if (!validation.success) {
      setErrors(validation.issues.map((issue) => issue.message))
      return
    }

    setIsEntitySigning(true)

    try {
      const payload: Payload = {
        data: hash(entity),
        sub: jwk.addr,
        iss: 'https://devtool.narval.xyz',
        iat: Math.floor(Date.now() / 1000)
      }

      const signature = await signAccountJwt(payload)

      await axios.post('/api/data-store', {
        entity: { signature, data: entity },
        policy: dataStore.policy
      })

      await getDataStore()
    } catch (error) {
      setErrors(error)
    }

    setIsEntitySigning(false)
  }

  const signPolicyDataStore = async (policy: Policy[]) => {
    if (!jwk || !dataStore) return

    setErrors(undefined)

    const policyValidationResult = policyDataSchema.safeParse({ policy: { data: policy } })

    if (!policyValidationResult.success) {
      setErrors(policyValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`))
      return
    }

    setIsPolicySigning(true)

    try {
      const payload: Payload = {
        data: hash(policy),
        sub: jwk.addr,
        iss: 'https://devtool.narval.xyz',
        iat: Math.floor(Date.now() / 1000)
      }

      const signature = await signAccountJwt(payload)

      await axios.post('/api/data-store', {
        entity: dataStore.entity,
        policy: { signature, data: policy }
      })

      await getDataStore()
    } catch (error) {
      setErrors(error)
    }

    setIsPolicySigning(false)
  }

  return { dataStore, isEntitySigning, isPolicySigning, errors, getDataStore, signEntityDataStore, signPolicyDataStore }
}

export default useDataStoreApi
