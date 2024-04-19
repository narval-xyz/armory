import {
  Action,
  Entities,
  EntityData,
  EntityStore,
  EntityUtil,
  EvaluationRequest,
  FIXTURE,
  Policy,
  PolicyData,
  PolicyStore,
  SetEntitiesAction,
  SetPoliciesAction
} from '@narval/policy-engine-shared'
import { Payload, hash } from '@narval/signature'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { extractErrorMessage } from '../_lib/utils'
import useAccountSignature from './useAccountSignature'
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
  const { signAccountJwt } = useAccountSignature()
  const [dataStore, setDataStore] = useState<DataStore>()
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
      setValidationErrors(extractErrorMessage(error))
    }

    setDataStore(data)
    return data
  }

  const signEntityDataStore = async (entities: Entities, callback: () => Promise<void>) => {
    if (!engineClientId || !engineClientSecret || !entityDataStoreUrl) return

    setErrors(undefined)
    setValidationErrors(undefined)

    const entityValidationResult = EntityData.safeParse({ entity: { data: entities } })

    if (!entityValidationResult.success) {
      setValidationErrors(
        entityValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`).join(', ')
      )
      return
    }

    const validation = EntityUtil.validate(entities)

    if (!validation.success) {
      setValidationErrors(validation.issues.map((issue) => issue.message).join(', '))
      return
    }

    setIsEntitySigning(true)

    try {
      const request: SetEntitiesAction = {
        action: Action.SET_ENTITIES,
        nonce: uuid(),
        data: entities
      }

      const evaluationRequest = await signRequest(request)

      await axios.post(
        entityDataStoreUrl,
        { evaluationRequest, entities },
        {
          headers: {
            ...JSON.parse(entityDataStoreHeaders),
            'x-client-id': engineClientId,
            'x-client-secret': engineClientSecret
          }
        }
      )

      await callback()
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setIsEntitySigning(false)
  }

  const signPolicyDataStore = async (policies: Policy[], callback: () => Promise<void>) => {
    if (!engineClientId || !engineClientSecret || !policyDataStoreUrl) return

    setErrors(undefined)
    setValidationErrors(undefined)

    const policyValidationResult = PolicyData.safeParse({ policy: { data: policies } })

    if (!policyValidationResult.success) {
      setValidationErrors(
        policyValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`).join(', ')
      )
      return
    }

    setIsPolicySigning(true)

    try {
      const request: SetPoliciesAction = {
        action: Action.SET_POLICIES,
        nonce: uuid(),
        data: policies
      }

      const evaluationRequest = await signRequest(request)

      await axios.post(
        policyDataStoreUrl,
        { evaluationRequest, policies },
        {
          headers: {
            ...JSON.parse(policyDataStoreHeaders),
            'x-client-id': engineClientId,
            'x-client-secret': engineClientSecret
          }
        }
      )

      await callback()
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }

    setIsPolicySigning(false)
  }

  const signRequest = async (request: SetEntitiesAction | SetPoliciesAction): Promise<EvaluationRequest> => {
    const payload: Payload = {
      iss: uuid(),
      requestHash: hash(request)
    }

    const authentication = await signAccountJwt(payload)

    return { authentication, request }
  }

  return {
    dataStore,
    isEntitySigning,
    isPolicySigning,
    errors,
    validationErrors,
    signEntityDataStore,
    signPolicyDataStore
  }
}

export default useAdminApi
