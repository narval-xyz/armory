import {
  DataStoreClientConfig,
  getEntities,
  getPolicies,
  setEntities,
  setPolicies,
  signDataPayload
} from '@narval/armory-sdk'
import {
  Entities,
  EntityData,
  EntityStore,
  EntityUtil,
  Policy,
  PolicyData,
  PolicyStore
} from '@narval/policy-engine-shared'
import { SigningAlg } from '@narval/signature'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { extractErrorMessage } from '../_lib/utils'
import useAccountSignature from './useAccountSignature'
import useStore from './useStore'

const useDataStoreApi = () => {
  const {
    authUrl,
    authClientId,
    authClientSecret,
    entityDataStoreUrl: entityStoreHost,
    policyDataStoreUrl: policyStoreHost
  } = useStore()

  const { jwk, signer } = useAccountSignature()

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

  const sdkDataStoreConfig = useMemo<DataStoreClientConfig | null>(() => {
    if (!authClientId || !entityStoreHost || !policyStoreHost || !jwk || !signer) {
      return null
    }

    return {
      dataStoreClientId: authClientId,
      dataStoreClientSecret: authClientSecret,
      entityStoreHost,
      policyStoreHost,
      jwk,
      alg: SigningAlg.EIP191,
      signer
    }
  }, [authClientId, authClientSecret, entityStoreHost, policyStoreHost, jwk, signer])

  useEffect(() => {
    getEntityStore()
  }, [entityStoreHost])

  useEffect(() => {
    getPolicyStore()
  }, [policyStoreHost])

  const getEntityStore = useCallback(async () => {
    try {
      setProcessingStatus((prev) => ({ ...prev, isFetchingEntity: true }))
      const entity = await getEntities(entityStoreHost)
      setEntityStore(entity)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setProcessingStatus((prev) => ({ ...prev, isFetchingEntity: false }))
  }, [entityStoreHost])

  const getPolicyStore = useCallback(async () => {
    try {
      setProcessingStatus((prev) => ({ ...prev, isFetchingPolicy: true }))
      const policy = await getPolicies(policyStoreHost)
      setPolicyStore(policy)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setProcessingStatus((prev) => ({ ...prev, isFetchingPolicy: false }))
  }, [policyStoreHost])

  const signEntityData = async (data: Entities) => {
    if (!sdkDataStoreConfig) return

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
      setProcessingStatus((prev) => ({ ...prev, isSigningEntity: false }))
      const { dataStoreClientId: clientId, ...config } = sdkDataStoreConfig

      return signDataPayload({ clientId, ...config }, data)
    } catch (error) {
      setErrors(extractErrorMessage(error))
      setProcessingStatus((prev) => ({ ...prev, isSigningEntity: false }))
    }
  }

  const signPolicyData = async (data: Policy[]) => {
    if (!sdkDataStoreConfig) return

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
      setProcessingStatus((prev) => ({ ...prev, isSigningPolicy: false }))
      const { dataStoreClientId: clientId, ...config } = sdkDataStoreConfig

      return signDataPayload({ clientId, ...config }, data)
    } catch (error) {
      setErrors(extractErrorMessage(error))
      setProcessingStatus((prev) => ({ ...prev, isSigningPolicy: false }))
    }
  }

  const signAndPushEntity = async (data: Entities) => {
    if (!sdkDataStoreConfig) return

    try {
      setProcessingStatus((prev) => ({ ...prev, isSigningAndPushingEntity: true }))

      await setEntities(sdkDataStoreConfig, data)
      setErrors(undefined)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setProcessingStatus((prev) => ({ ...prev, isSigningAndPushingEntity: false }))
  }

  const signAndPushPolicy = async (data: Policy[]) => {
    if (!sdkDataStoreConfig) return

    try {
      setProcessingStatus((prev) => ({ ...prev, isSigningAndPushingPolicy: true }))

      await setPolicies(sdkDataStoreConfig, data)
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setProcessingStatus((prev) => ({ ...prev, isSigningAndPushingPolicy: false }))
  }

  return {
    entityStore,
    policyStore,
    errors,
    processingStatus,
    sdkDataStoreConfig,
    validationErrors,
    getEntityStore,
    getPolicyStore,
    signEntityData,
    signPolicyData,
    signAndPushEntity,
    signAndPushPolicy
  }
}

export default useDataStoreApi
