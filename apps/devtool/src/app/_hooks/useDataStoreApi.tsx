import {
  Entities,
  EntityData,
  EntitySignature,
  EntityUtil,
  Policy,
  PolicyData,
  PolicySignature
} from '@narval/policy-engine-shared'
import { Payload, hash } from '@narval/signature'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { extractErrorMessage } from '../_lib/utils'
import useAccountSignature from './useAccountSignature'
import useStore from './useStore'

const useDataStoreApi = () => {
  const { entityDataStoreUrl, policyDataStoreUrl, entitySignatureUrl, policySignatureUrl } = useStore()
  const { jwk, signAccountJwt } = useAccountSignature()

  const [entitySignature, setEntitySignature] = useState('')
  const [policySignature, setPolicySignature] = useState('')
  const [dataStore, setDataStore] = useState<{ entity: Entities; policy: Policy[] }>()
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

  const getEntitySignature = async () => {
    const {
      data: { entity }
    } = await axios.get<EntitySignature>(entityDataStoreUrl)

    setEntitySignature(entity.signature)

    return entity.signature
  }

  const getPolicySignature = async () => {
    const {
      data: { policy }
    } = await axios.get<PolicySignature>(policyDataStoreUrl)

    setPolicySignature(policy.signature)

    return policy.signature
  }

  const getEntityData = async () => {
    const {
      data: { entity }
    } = await axios.get<EntityData>(entityDataStoreUrl)

    return entity.data
  }

  const getPolicyData = async () => {
    const {
      data: { policy }
    } = await axios.get<PolicyData>(policyDataStoreUrl)

    return policy.data
  }

  const getDataStore = async () => {
    const [entitySignature, entityData, policySignature, policyData] = await Promise.all([
      getEntitySignature(),
      getEntityData(),
      getPolicySignature(),
      getPolicyData()
    ])

    setEntitySignature(entitySignature)
    setPolicySignature(policySignature)
    setDataStore({ entity: entityData, policy: policyData })
  }

  const signEntityData = async (data: Entities) => {
    if (!jwk || !dataStore) return

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

    try {
      const payload: Payload = {
        data: hash(data),
        sub: jwk.addr,
        iss: 'https://devtool.narval.xyz',
        iat: Math.floor(Date.now() / 1000)
      }

      const signature = await signAccountJwt(payload)

      setEntitySignature(signature)

      return signature
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const pushEntityData = async (data: Entities) => {
    try {
      await axios.post(entityDataStoreUrl, { entity: { data } })
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const pushEntitySignature = async (signature: string) => {
    try {
      await axios.post(entitySignatureUrl, { entity: { signature } })
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const signAndPushEntity = async (data: Entities) => {
    const signature = await signEntityData(data)
    if (!signature) return
    await pushEntityData(data)
    await pushEntitySignature(signature)
  }

  const signPolicyData = async (data: Policy[]) => {
    if (!jwk || !dataStore) return

    setErrors(undefined)
    setValidationErrors(undefined)

    const policyValidationResult = PolicyData.safeParse({ policy: { data } })

    if (!policyValidationResult.success) {
      setValidationErrors(
        policyValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`).join(', ')
      )
      return
    }

    try {
      const payload: Payload = {
        data: hash(data),
        sub: jwk.addr,
        iss: 'https://devtool.narval.xyz',
        iat: Math.floor(Date.now() / 1000)
      }

      const signature = await signAccountJwt(payload)

      setPolicySignature(signature)

      return signature
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const pushPolicyData = async (data: Policy[]) => {
    try {
      await axios.post(policyDataStoreUrl, { policy: { data } })
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const pushPolicySignature = async (signature: string) => {
    try {
      await axios.post(policySignatureUrl, { policy: { signature } })
    } catch (error) {
      setErrors(extractErrorMessage(error))
    }
  }

  const signAndPushPolicy = async (data: Policy[]) => {
    const signature = await signPolicyData(data)
    if (!signature) return
    await pushPolicyData(data)
    await pushPolicySignature(signature)
  }

  return {
    dataStore,
    entitySignature,
    policySignature,
    errors,
    validationErrors,
    pingDataStore,
    getEntitySignature,
    getEntityData,
    getPolicySignature,
    getPolicyData,
    getDataStore,
    signEntityData,
    pushEntityData,
    pushEntitySignature,
    signAndPushEntity,
    signPolicyData,
    pushPolicyData,
    pushPolicySignature,
    signAndPushPolicy
  }
}

export default useDataStoreApi
