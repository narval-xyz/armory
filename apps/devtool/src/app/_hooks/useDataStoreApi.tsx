import {
  Entities,
  EntityData,
  EntityStore,
  EntityUtil,
  Policy,
  PolicyData,
  PolicyStore
} from '@narval/policy-engine-shared'
import { Payload, hash } from '@narval/signature'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { extractErrorMessage } from '../_lib/utils'
import useAccountSignature from './useAccountSignature'

const useDataStoreApi = () => {
  const { jwk, signAccountJwt } = useAccountSignature()

  const [dataStore, setDataStore] = useState<{ entity: Entities; policy: Policy[] }>()
  const [isEntitySigning, setIsEntitySigning] = useState(false)
  const [isPolicySigning, setIsPolicySigning] = useState(false)
  const [errors, setErrors] = useState<string>()
  const [validationErrors, setValidationErrors] = useState<string>()

  useEffect(() => {
    if (!dataStore) {
      getDataStore()
    }
  }, [dataStore])

  const getDataStore = async () => {
    const { data } = await axios.get<{ entity: EntityStore; policy: PolicyStore }>('/api/data-store')

    setDataStore({ entity: data.entity.data, policy: data.policy.data })

    return data
  }

  const signEntityDataStore = async (entity: Entities, callback: () => Promise<void>) => {
    if (!jwk || !dataStore) return

    setErrors(undefined)
    setValidationErrors(undefined)

    const entityValidationResult = EntityData.safeParse({ entity: { data: entity } })

    if (!entityValidationResult.success) {
      setValidationErrors(
        entityValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`).join(', ')
      )
      return
    }

    const validation = EntityUtil.validate(entity)

    if (!validation.success) {
      setValidationErrors(validation.issues.map((issue) => issue.message).join(', '))
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
        entity: { signature, data: entity }
      })

      await callback()
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setIsEntitySigning(false)
  }

  const signPolicyDataStore = async (policy: Policy[], callback: () => Promise<void>) => {
    if (!jwk || !dataStore) return

    setErrors(undefined)
    setValidationErrors(undefined)

    const policyValidationResult = PolicyData.safeParse({ policy: { data: policy } })

    if (!policyValidationResult.success) {
      setValidationErrors(
        policyValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`).join(', ')
      )
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
        policy: { signature, data: policy }
      })

      await callback()
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setIsPolicySigning(false)
  }

  return {
    dataStore,
    isEntitySigning,
    isPolicySigning,
    errors,
    validationErrors,
    getDataStore,
    signEntityDataStore,
    signPolicyDataStore
  }
}

export default useDataStoreApi
