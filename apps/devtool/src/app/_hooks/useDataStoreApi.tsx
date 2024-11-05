import {
  Entities,
  EntityData,
  EntityStore,
  EntityStoreClient,
  EntityUtil,
  Policy,
  PolicyData,
  PolicyStore,
  PolicyStoreClient,
  SigningAlg
} from '@narval/armory-sdk'
import { useEffect, useMemo, useState } from 'react'
import { backOff, extractErrorMessage, getHost, isValidUrl } from '../_lib/utils'
import useAccountSignature from './useAccountSignature'
import useStore from './useStore'

const useDataStoreApi = () => {
  const {
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
    isSigningAndPushingPolicy: false,
    entityFetchError: false,
    policyFetchError: false
  })
  const [entityStore, setEntityStore] = useState<EntityStore>()
  const [policyStore, setPolicyStore] = useState<PolicyStore>()
  const [pageError, setPageError] = useState<string>()
  const [policyError, setPolicyError] = useState<string>()
  const [entityError, setEntityError] = useState<string>()
  const [validationErrors, setValidationErrors] = useState<string>()

  const entityStoreClient = useMemo<EntityStoreClient | null>(() => {
    if (!isValidUrl(entityStoreHost) || !authClientId || !authClientSecret || !jwk || !signer) {
      return null
    }

    return new EntityStoreClient({
      host: getHost(entityStoreHost),
      clientId: authClientId,
      clientSecret: authClientSecret,
      signer: {
        jwk,
        alg: SigningAlg.EIP191,
        sign: signer
      }
    })
  }, [entityStoreHost, authClientId, authClientSecret, jwk, signer])

  const policyStoreClient = useMemo<PolicyStoreClient | null>(() => {
    if (!isValidUrl(policyStoreHost) || !authClientId || !authClientSecret || !jwk || !signer) {
      return null
    }

    return new PolicyStoreClient({
      host: getHost(policyStoreHost),
      clientId: authClientId,
      clientSecret: authClientSecret,
      signer: {
        jwk,
        alg: SigningAlg.EIP191,
        sign: signer
      }
    })
  }, [policyStoreHost, authClientId, authClientSecret, jwk, signer])

  useEffect(() => {
    if (entityStoreClient && !entityStore && !processingStatus.entityFetchError) {
      getEntityStore()
    }
  }, [entityStoreClient, entityStore, processingStatus.entityFetchError])

  useEffect(() => {
    if (policyStoreClient && !policyStore && !processingStatus.policyFetchError) {
      getPolicyStore()
    }
  }, [policyStoreClient, policyStore, processingStatus.policyFetchError])

  const getEntityStore = async () => {
    if (!entityStoreClient || processingStatus.isFetchingEntity) return

    try {
      setProcessingStatus((prev) => ({ ...prev, isFetchingEntity: true }))
      const entity = await backOff(() => entityStoreClient.fetch(), { maxRetries: 3 })
      setEntityStore(entity)
      setProcessingStatus((prev) => ({ ...prev, entityFetchError: false }))
    } catch (error) {
      setEntityError(extractErrorMessage(error))
      setProcessingStatus((prev) => ({ ...prev, entityFetchError: true }))
      throw error
    } finally {
      setProcessingStatus((prev) => ({ ...prev, isFetchingEntity: false }))
    }
  }
  const getPolicyStore = async () => {
    if (!policyStoreClient || processingStatus.isFetchingPolicy) return

    try {
      setProcessingStatus((prev) => ({ ...prev, isFetchingPolicy: true }))
      const policy = await backOff(() => policyStoreClient.fetch(), { maxRetries: 3 })
      setPolicyStore(policy)
      setProcessingStatus((prev) => ({ ...prev, policyFetchError: false }))
    } catch (error) {
      setPolicyError(extractErrorMessage(error))
      setProcessingStatus((prev) => ({ ...prev, policyFetchError: true }))
      throw error
    } finally {
      setProcessingStatus((prev) => ({ ...prev, isFetchingPolicy: false }))
    }
  }

  const validateEntityData = (data: Entities) => {
    const entityValidationResult = EntityData.safeParse({ entity: { data } })

    if (!entityValidationResult.success) {
      setValidationErrors(
        entityValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`).join(', ')
      )
      return false
    }

    const validation = EntityUtil.validate(data)

    if (!validation.success) {
      setValidationErrors(validation.issues.map((issue) => issue.message).join(', '))
      return false
    }

    return true
  }

  const validatePolicyData = (data: Policy[]) => {
    const policyValidationResult = PolicyData.safeParse({ policy: { data } })

    if (!policyValidationResult.success) {
      setValidationErrors(
        policyValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`).join(', ')
      )
      return false
    }

    return true
  }

  const signEntityData = async (data: Entities) => {
    if (!entityStoreClient || !validateEntityData(data)) return

    setPageError(undefined)
    setValidationErrors(undefined)

    try {
      setProcessingStatus((prev) => ({ ...prev, isSigningEntity: true }))
      const signature = await entityStoreClient.sign(data)
      setEntityStore({ signature, data })
    } catch (error) {
      setPageError(extractErrorMessage(error))
      throw error
    } finally {
      setProcessingStatus((prev) => ({ ...prev, isSigningEntity: false }))
    }
  }

  const signPolicyData = async (data: Policy[]) => {
    if (!policyStoreClient || !validatePolicyData(data)) return

    setPageError(undefined)
    setValidationErrors(undefined)

    try {
      setProcessingStatus((prev) => ({ ...prev, isSigningPolicy: true }))
      const signature = await policyStoreClient.sign(data)
      setPolicyStore({ signature, data })
    } catch (error) {
      setPageError(extractErrorMessage(error))
      throw error
    } finally {
      setProcessingStatus((prev) => ({ ...prev, isSigningPolicy: false }))
    }
  }

  const signAndPushEntity = async (data: Entities) => {
    if (!entityStoreClient || !validateEntityData(data)) return

    try {
      setPageError(undefined)
      setProcessingStatus((prev) => ({ ...prev, isSigningAndPushingEntity: true }))
      await entityStoreClient.signAndPush(data)
      await getEntityStore()
    } catch (error) {
      setPageError(extractErrorMessage(error))
      throw error
    } finally {
      setProcessingStatus((prev) => ({ ...prev, isSigningAndPushingEntity: false }))
    }
  }

  const signAndPushPolicy = async (data: Policy[]) => {
    if (!policyStoreClient || !validatePolicyData(data)) return

    try {
      setPageError(undefined)
      setProcessingStatus((prev) => ({ ...prev, isSigningAndPushingPolicy: true }))
      await policyStoreClient.signAndPush(data)
      await getPolicyStore()
    } catch (error) {
      setPageError(extractErrorMessage(error))
      throw error
    } finally {
      setProcessingStatus((prev) => ({ ...prev, isSigningAndPushingPolicy: false }))
    }
  }

  return {
    entityStore,
    policyStore,
    pageError,
    policyError,
    entityError,
    processingStatus,
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
