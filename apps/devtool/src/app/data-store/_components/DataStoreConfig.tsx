'use client'

import { faCheckCircle, faSpinner } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Editor from '@monaco-editor/react'
import { EntityStore, EntityUtil, PolicyStore, entityDataSchema, policyDataSchema } from '@narval/policy-engine-shared'
import { Curves, Jwk, KeyTypes, Payload, SigningAlg, hash, hexToBase64Url, signJwt } from '@narval/signature'
import { signMessage } from '@wagmi/core'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import NarButton from '../../_design-system/NarButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import useStore from '../../_hooks/useStore'
import { config } from '../../_lib/config'

const ActionStatus = (isDone: boolean, label: string) => {
  if (!isDone) {
    return (
      <div className="flex items-center gap-4">
        <FontAwesomeIcon icon={faSpinner} spin />
        <div className="text-nv-white">{label}</div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <FontAwesomeIcon icon={faCheckCircle} className="text-nv-green-500" />
      <div className="text-nv-white">{label}</div>
    </div>
  )
}

const DataStoreConfig = () => {
  const account = useAccount()
  const {
    engineUrl,
    engineClientId,
    engineClientSecret,
    entityDataStoreUrl,
    setEntityDataStoreUrl,
    entitySignatureUrl,
    setEntitySignatureUrl,
    policyDataStoreUrl,
    setPolicyDataStoreUrl,
    policySignatureUrl,
    setPolicySignatureUrl
  } = useStore()

  const [data, setData] = useState<string>()
  const [dataStore, setDataStore] = useState<{ entity: EntityStore; policy: PolicyStore }>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isEntitySigning, setIsEntitySigning] = useState(false)
  const [isPolicySigning, setIsPolicySigning] = useState(false)
  const [processingStatus, setProcessingStatus] = useState({
    entitySigned: false,
    policySigned: false,
    dataSaved: false,
    engineSynced: false
  })

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  useEffect(() => {
    if (data) return

    const getData = async () => {
      const dataStore = await axios.get('/api/data-store')
      const { entity, policy } = dataStore.data
      setData(JSON.stringify({ entity: entity.data, policy: policy.data }, null, 2))
      setDataStore(dataStore.data)
    }

    getData()
  }, [data])

  const signEntityData = async () => {
    if (!data || !dataStore) return
    if (!account.address) return

    const { entity } = JSON.parse(data)

    const entityValidationResult = entityDataSchema.safeParse({ entity: { data: entity } })

    if (!entityValidationResult.success) {
      setValidationErrors(
        entityValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`)
      )
      setIsDialogOpen(true)
      return
    }

    const validation = EntityUtil.validate(entity)

    if (!validation.success) {
      setValidationErrors(validation.issues.map((issue) => issue.message))
      setIsDialogOpen(true)
      return
    }

    setIsEntitySigning(true)

    const jwtSigner = async (message: string) => {
      const jwtSig = await signMessage(config, { message })

      return hexToBase64Url(jwtSig)
    }

    const entityPayload: Payload = {
      data: hash(entity),
      sub: account.address,
      iss: 'https://devtool.narval.xyz',
      iat: Math.floor(Date.now() / 1000)
    }

    const jwk: Jwk = {
      kty: KeyTypes.EC,
      crv: Curves.SECP256K1,
      alg: SigningAlg.ES256K,
      kid: account.address,
      addr: account.address
    }

    const entitySig = await signJwt(entityPayload, jwk, { alg: SigningAlg.EIP191 }, jwtSigner)
    setProcessingStatus((prev) => ({ ...prev, entitySigned: true }))

    await axios.post('/api/data-store', {
      entity: {
        signature: entitySig,
        data: entity
      },
      policy: dataStore.policy
    })
    setProcessingStatus((prev) => ({ ...prev, dataSaved: true }))

    await axios.post(`${engineUrl}/tenants/sync`, null, {
      headers: {
        'x-client-id': engineClientId,
        'x-client-secret': engineClientSecret
      }
    })
    setProcessingStatus((prev) => ({ ...prev, engineSynced: true }))

    setTimeout(() => {
      setIsEntitySigning(false)
      setProcessingStatus({
        entitySigned: false,
        policySigned: false,
        dataSaved: false,
        engineSynced: false
      })
    }, 5000)
  }

  const signPolicyData = async () => {
    if (!data || !dataStore) return
    if (!account.address) return

    const { policy } = JSON.parse(data)

    const policyValidationResult = policyDataSchema.safeParse({ policy: { data: policy } })

    if (!policyValidationResult.success) {
      setValidationErrors(
        policyValidationResult.error.errors.map((error) => `${error.path.join('.')}:${error.message}`)
      )
      setIsDialogOpen(true)
      return
    }

    setIsPolicySigning(true)

    const jwtSigner = async (message: string) => {
      const jwtSig = await signMessage(config, { message })

      return hexToBase64Url(jwtSig)
    }

    const policyPayload: Payload = {
      data: hash(policy),
      sub: account.address,
      iss: 'https://devtool.narval.xyz',
      iat: Math.floor(Date.now() / 1000)
    }

    const jwk: Jwk = {
      kty: KeyTypes.EC,
      crv: Curves.SECP256K1,
      alg: SigningAlg.ES256K,
      kid: account.address,
      addr: account.address
    }

    const policySig = await signJwt(policyPayload, jwk, { alg: SigningAlg.EIP191 }, jwtSigner)
    setProcessingStatus((prev) => ({ ...prev, policySigned: true }))

    await axios.post('/api/data-store', {
      entity: dataStore.entity,
      policy: {
        signature: policySig,
        data: policy
      }
    })
    setProcessingStatus((prev) => ({ ...prev, dataSaved: true }))

    await axios.post(`${engineUrl}/tenants/sync`, null, {
      headers: {
        'x-client-id': engineClientId,
        'x-client-secret': engineClientSecret
      }
    })
    setProcessingStatus((prev) => ({ ...prev, engineSynced: true }))

    setTimeout(() => {
      setIsPolicySigning(false)
      setProcessingStatus({
        entitySigned: false,
        policySigned: false,
        dataSaved: false,
        engineSynced: false
      })
    }, 5000)
  }

  return (
    <>
      <div className="flex gap-12">
        <div className="flex flex-col gap-10 w-1/3">
          <div className="text-nv-2xl">Configuration</div>
          <div className="flex flex-col gap-6 ">
            <NarInput label="Data URL" value={entityDataStoreUrl} onChange={setEntityDataStoreUrl} />
            <NarInput label="Signature URL" value={entitySignatureUrl} onChange={setEntitySignatureUrl} />
            <NarInput label="Data URL" value={policyDataStoreUrl} onChange={setPolicyDataStoreUrl} />
            <NarInput label="Signature URL" value={policySignatureUrl} onChange={setPolicySignatureUrl} />
            <div className="flex flex-row-reverse">
              {!isEntitySigning && !isPolicySigning ? (
                <div className="flex items-center gap-5">
                  <NarButton label="Sign Entity" onClick={signEntityData} />
                  <NarButton label="Sign Policy" onClick={signPolicyData} />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {isEntitySigning &&
                    ActionStatus(
                      processingStatus.entitySigned,
                      processingStatus.entitySigned ? 'Entity Data Signed!' : 'Signing Entity Data...'
                    )}
                  {isPolicySigning &&
                    ActionStatus(
                      processingStatus.policySigned,
                      processingStatus.policySigned ? 'Policy Data Signed!' : 'Signing Policy Data...'
                    )}
                  {ActionStatus(
                    processingStatus.dataSaved,
                    processingStatus.dataSaved ? 'Data Saved!' : 'Saving Data...'
                  )}
                  {ActionStatus(
                    processingStatus.engineSynced,
                    processingStatus.engineSynced ? 'Engine Synced!' : 'Syncing Engine...'
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="border-2 border-white rounded-xl p-4 w-2/3">
          <Editor
            height="70vh"
            language="json"
            value={data}
            onChange={(value) => setData(value)}
            onMount={(editor, monaco) => {
              editorRef.current = editor
              monacoRef.current = monaco
            }}
          />
        </div>
      </div>
      {isDialogOpen && (
        <NarDialog
          triggerButton={<></>}
          title="Data validation failed"
          primaryButtonLabel="OK"
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onDismiss={() => setIsDialogOpen(false)}
          isConfirm
        >
          <div className="px-12 py-4">
            <ul className="flex flex-col gap-1 text-nv-white text-nv-sm list-disc">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </NarDialog>
      )}
    </>
  )
}

export default DataStoreConfig
