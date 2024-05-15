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

  const [processingStatus, setProcessingStatus] = useState({
    isFetchingEntity: false,
    isFetchingPolicy: false,
    isSigningEntity: false,
    isSigningPolicy: false,
    isSigningAndPushingEntity: false,
    isSigningAndPushingPolicy: false
  })
  const [entityStore, setEntityStore] = useState<EntityStore>()
  const [policyStore, setPolicyStore] = useState<PolicyStore>()
  const [errors, setErrors] = useState<string>()
  const [validationErrors, setValidationErrors] = useState<string>()

  useEffect(() => {
    if (entityStore) return

    getEntityStore()
  }, [entityStore])

  useEffect(() => {
    if (policyStore) return

    getPolicyStore()
  }, [policyStore])

  const pingDataStore = async (url: string) => {
    try {
      await axios.get(url)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const getEntityStore = async () => {
    setProcessingStatus((prev) => ({ ...prev, isFetchingEntity: true }))

    try {
      const {
        data: { entity }
      } = await axios.get<{ entity: EntityStore }>(entityDataStoreUrl)
      setEntityStore(entity)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setProcessingStatus((prev) => ({ ...prev, isFetchingEntity: false }))
  }

  const getPolicyStore = async () => {
    setProcessingStatus((prev) => ({ ...prev, isFetchingPolicy: true }))

    try {
      const {
        data: { policy }
      } = await axios.get<{ policy: PolicyStore }>(policyDataStoreUrl)
      setPolicyStore(policy)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setProcessingStatus((prev) => ({ ...prev, isFetchingPolicy: false }))
  }

  const signEntityData = async (data: Entities) => {
    if (!jwk) return

    setErrors(undefined)
    setValidationErrors(undefined)

    const entityValidationResult = EntityData.safeParse({ entity: { data } })

    if (!entityValidationResult.success) {
      setValidationErrors(
        entityValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`).join(', ')
      )
      return
    }

    const validation = EntityUtil.validate(data)

    if (!validation.success) {
      setValidationErrors(validation.issues.map((issue) => issue.message).join(', '))
      return
    }

    setProcessingStatus((prev) => ({ ...prev, isSigningEntity: true }))

    try {
      const payload: Payload = {
        data: hash(data),
        sub: jwk.addr,
        iss: 'https://devtool.narval.xyz',
        iat: Math.floor(Date.now() / 1000)
      }

      setProcessingStatus((prev) => ({ ...prev, isSigningEntity: false }))

      return signAccountJwt(payload)
    } catch (error) {
      setErrors(extractErrorMessage(error))
      setProcessingStatus((prev) => ({ ...prev, isSigningEntity: false }))
    }
  }

  const signPolicyData = async (data: Policy[]) => {
    if (!jwk) return

    setErrors(undefined)
    setValidationErrors(undefined)

    const policyValidationResult = PolicyData.safeParse({ policy: { data } })

    if (!policyValidationResult.success) {
      setValidationErrors(
        policyValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`).join(', ')
      )
      return
    }

    setProcessingStatus((prev) => ({ ...prev, isSigningPolicy: true }))

    try {
      const payload: Payload = {
        data: hash(data),
        sub: jwk.addr,
        iss: 'https://devtool.narval.xyz',
        iat: Math.floor(Date.now() / 1000)
      }

      setProcessingStatus((prev) => ({ ...prev, isSigningPolicy: false }))

      return signAccountJwt(payload)
    } catch (error) {
      setErrors(extractErrorMessage(error))
      setProcessingStatus((prev) => ({ ...prev, isSigningPolicy: false }))
    }
  }

  const signAndPushEntity = async (data: Entities) => {
    setProcessingStatus((prev) => ({ ...prev, isSigningAndPushingEntity: true }))

    try {
      const signature = await signEntityData(data)
      if (!signature) return
      await axios.post(entityDataStoreUrl, { entity: { signature, data } })
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setProcessingStatus((prev) => ({ ...prev, isSigningAndPushingEntity: false }))
  }

  const signAndPushPolicy = async (data: Policy[]) => {
    setProcessingStatus((prev) => ({ ...prev, isSigningAndPushingPolicy: true }))

    try {
      const signature = await signPolicyData(data)
      if (!signature) return
      await axios.post(policyDataStoreUrl, { policy: { signature, data } })
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setProcessingStatus((prev) => ({ ...prev, isSigningAndPushingPolicy: false }))
  }

  return {
    entityStore,
    policyStore,
    errors,
    validationErrors,
    processingStatus,
    pingDataStore,
    getEntityStore,
    getPolicyStore,
    signEntityData,
    signAndPushEntity,
    signPolicyData,
    signAndPushPolicy
  }
}

export default useDataStoreApi
