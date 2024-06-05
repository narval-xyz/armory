import { EngineClientConfig, getEntities, getPolicies, setEntities, setPolicies, signData } from '@narval/armory-sdk'
import {
  Entities,
  EntityData,
  EntityStore,
  EntityUtil,
  Policy,
  PolicyData,
  PolicyStore
} from '@narval/policy-engine-shared'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { LOCAL_DATA_STORE_URL, MANAGED_ENTITY_DATA_STORE_PATH, MANAGED_POLICY_DATA_STORE_PATH } from '../_lib/constants'
import { extractErrorMessage } from '../_lib/utils'
import useEngineApi from './useEngineApi'
import useStore from './useStore'

const useDataStoreApi = () => {
  const {
    authServerUrl,
    engineClientId,
    entityDataStoreUrl: entityStoreHost,
    policyDataStoreUrl: policyStoreHost,
    setEntityDataStoreUrl,
    setPolicyDataStoreUrl
  } = useStore()
  const { sdkEngineConfig } = useEngineApi()

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

  const isUsingManagedDataStore =
    !entityStoreHost.startsWith(LOCAL_DATA_STORE_URL) && !policyStoreHost.startsWith(LOCAL_DATA_STORE_URL)

  const sdkDataStoreConfig = useMemo<
    | (EngineClientConfig & {
        entityStoreHost: string
        policyStoreHost: string
      })
    | null
  >(() => {
    if (!sdkEngineConfig || !entityStoreHost || !policyStoreHost) {
      return null
    }

    return {
      ...sdkEngineConfig,
      entityStoreHost,
      policyStoreHost
    }
  }, [sdkEngineConfig, entityStoreHost, policyStoreHost])

  useEffect(() => {
    getEntityStore()
  }, [entityStoreHost])

  useEffect(() => {
    getPolicyStore()
  }, [policyStoreHost])

  const switchDataStore = useCallback(async () => {
    if (!engineClientId) return

    if (!entityStoreHost.startsWith(LOCAL_DATA_STORE_URL)) {
      setEntityDataStoreUrl(LOCAL_DATA_STORE_URL)
    } else {
      setEntityDataStoreUrl(`${authServerUrl}/${MANAGED_ENTITY_DATA_STORE_PATH}${engineClientId}`)
    }

    if (!policyStoreHost.startsWith(LOCAL_DATA_STORE_URL)) {
      setPolicyDataStoreUrl(LOCAL_DATA_STORE_URL)
    } else {
      setPolicyDataStoreUrl(`${authServerUrl}/${MANAGED_POLICY_DATA_STORE_PATH}${engineClientId}`)
    }
  }, [engineClientId, entityStoreHost, policyStoreHost])

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

      return signData(sdkDataStoreConfig, data)
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

      return signData(sdkDataStoreConfig, data)
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
    sdkDataStoreConfig,
    isUsingManagedDataStore,
    entityStore,
    policyStore,
    errors,
    validationErrors,
    processingStatus,
    getEntityStore,
    getPolicyStore,
    signEntityData,
    signAndPushEntity,
    signPolicyData,
    signAndPushPolicy,
    switchDataStore
  }
}

export default useDataStoreApi
