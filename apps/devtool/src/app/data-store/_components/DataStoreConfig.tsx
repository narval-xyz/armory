'use client'

import { faArrowRightArrowLeft, faPipe, faSpinner } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Entities,
  EntityStore,
  EntityUtil,
  PolicyStore,
  entityDataSchema,
  policyDataSchema
} from '@narval/policy-engine-shared'
import { Payload, hash } from '@narval/signature'
import axios from 'axios'
import { useEffect, useState } from 'react'
import GreenCheckStatus from '../../_components/GreenCheckStatus'
import NarButton from '../../_design-system/NarButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import useAccountSignature from '../../_hooks/useAccountSignature'
import useStore from '../../_hooks/useStore'
import CodeEditor from './CodeEditor'
import Users from './sections/Users'
import Wallets from './sections/Wallets'

const DataStoreConfig = () => {
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
  const { jwk, signAccountJwt } = useAccountSignature()

  const [data, setData] = useState<string>()
  const [dataStore, setDataStore] = useState<{ entity: EntityStore; policy: PolicyStore }>()
  const [displayCodeEditor, setDisplayCodeEditor] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isEntitySigning, setIsEntitySigning] = useState(false)
  const [isPolicySigning, setIsPolicySigning] = useState(false)
  const [isEngineSynced, setIsEngineSynced] = useState(false)

  const signEntityData = async () => {
    if (!data || !dataStore || !jwk) return

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

    try {
      const entityPayload: Payload = {
        data: hash(entity),
        sub: jwk.addr,
        iss: 'https://devtool.narval.xyz',
        iat: Math.floor(Date.now() / 1000)
      }

      const entitySig = await signAccountJwt(entityPayload)

      await axios.post('/api/data-store', {
        entity: {
          signature: entitySig,
          data: entity
        },
        policy: dataStore.policy
      })
      await getData()

      await axios.post(`${engineUrl}/clients/sync`, null, {
        headers: {
          'x-client-id': engineClientId,
          'x-client-secret': engineClientSecret
        }
      })

      setIsEngineSynced(true)
    } catch (error) {
      console.log(error)
    }

    setIsEntitySigning(false)

    setTimeout(() => setIsEngineSynced(false), 5000)
  }

  const signPolicyData = async () => {
    if (!data || !dataStore || !jwk) return

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

    try {
      const policyPayload: Payload = {
        data: hash(policy),
        sub: jwk.addr,
        iss: 'https://devtool.narval.xyz',
        iat: Math.floor(Date.now() / 1000)
      }

      const policySig = await signAccountJwt(policyPayload)

      await axios.post('/api/data-store', {
        entity: dataStore.entity,
        policy: {
          signature: policySig,
          data: policy
        }
      })

      await getData()

      await axios.post(`${engineUrl}/clients/sync`, null, {
        headers: {
          'x-client-id': engineClientId,
          'x-client-secret': engineClientSecret
        }
      })

      setIsEngineSynced(true)
    } catch (error) {
      console.log(error)
    }

    setIsPolicySigning(false)

    setTimeout(() => setIsEngineSynced(false), 5000)
  }

  const getData = async () => {
    const { data: dataStore } = await axios.get('/api/data-store')
    const { entity, policy } = dataStore
    setData(JSON.stringify({ entity: entity.data, policy: policy.data }, null, 2))
    setDataStore(dataStore)
  }

  useEffect(() => {
    getData()
  }, [])

  const updateEntityStore = async (updatedData: Partial<Entities>) => {
    setData((prev) => {
      const { entity: currentEntity, policy: currentPolicy } = prev ? JSON.parse(prev) : { entity: {}, policy: {} }
      return JSON.stringify({ entity: { ...currentEntity, ...updatedData }, policy: currentPolicy }, null, 2)
    })
  }

  return (
    <div className="flex flex-col gap-20">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Data Store</div>
        <div className="flex items-center gap-4">
          <GreenCheckStatus
            isChecked={isEngineSynced}
            label={isEngineSynced ? 'Engine Synced!' : 'Syncing Engine...'}
          />
          <NarButton
            label={isEntitySigning ? 'Signing...' : 'Sign Entity'}
            leftIcon={isEntitySigning ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
            onClick={signEntityData}
            disabled={isEntitySigning}
          />
          <NarButton
            label={isEntitySigning ? 'Signing...' : 'Sign Policy'}
            leftIcon={isPolicySigning ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
            onClick={signPolicyData}
            disabled={isPolicySigning}
          />
          <FontAwesomeIcon height="20" icon={faPipe} size="xl" />
          <NarButton
            variant="secondary"
            label={displayCodeEditor ? 'List View' : 'Code Editor View'}
            leftIcon={<FontAwesomeIcon icon={faArrowRightArrowLeft} size="lg" />}
            onClick={() => setDisplayCodeEditor((prev) => !prev)}
          />
        </div>
      </div>
      <div className="flex gap-20">
        <div className="flex flex-col gap-8 w-1/3">
          <NarInput label="Entity Data URL" value={entityDataStoreUrl} onChange={setEntityDataStoreUrl} />
          <NarInput label="Entity Signature URL" value={entitySignatureUrl} onChange={setEntitySignatureUrl} />
          <NarInput label="Policy Data URL" value={policyDataStoreUrl} onChange={setPolicyDataStoreUrl} />
          <NarInput label="Policy Signature URL" value={policySignatureUrl} onChange={setPolicySignatureUrl} />
        </div>
        <div className="flex flex-col gap-8 w-2/3">
          {displayCodeEditor && <CodeEditor value={data} onChange={setData} />}
          {!displayCodeEditor && (
            <>
              <Users
                users={data ? JSON.parse(data).entity.users : undefined}
                onChange={(users) => updateEntityStore({ users })}
              />
              <Wallets
                wallets={data ? JSON.parse(data).entity.wallets : undefined}
                onChange={(wallets) => updateEntityStore({ wallets })}
              />
            </>
          )}
        </div>
      </div>
      {isDialogOpen && (
        <NarDialog
          triggerButton={null}
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
    </div>
  )
}

export default DataStoreConfig
