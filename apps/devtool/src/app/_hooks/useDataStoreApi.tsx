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
import useStore from './useStore'

const useDataStoreApi = () => {
  const { entityDataStoreUrl, policyDataStoreUrl } = useStore()
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

  const pingDataStore = async (url: string) => {
    try {
      await axios.get(url)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const getDataStore = async () => {
    const [{ data: entityData }, { data: policyData }] = await Promise.all([
      axios.get<{ entity: EntityStore }>(entityDataStoreUrl),
      axios.get<{ policy: PolicyStore }>(policyDataStoreUrl)
    ])

    const data = { entity: entityData.entity.data, policy: policyData.policy.data }

    setDataStore(data)

    return data
  }

  const signEntityDataStore = async (entity: Entities) => {
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

      await axios.post(entityDataStoreUrl, {
        entity: { signature, data: entity }
      })
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setIsEntitySigning(false)
  }

  const signPolicyDataStore = async (policy: Policy[]) => {
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

      await axios.post(policyDataStoreUrl, {
        policy: { signature, data: policy }
      })
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
    pingDataStore,
    getDataStore,
    signEntityDataStore,
    signPolicyDataStore
  }
}

export default useDataStoreApi
