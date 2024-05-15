'use client'

import { faArrowRightArrowLeft, faPipe, faRotateRight, faSpinner } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Entities } from '@narval/policy-engine-shared'
import { useEffect, useState } from 'react'
import ErrorStatus from '../../_components/ErrorStatus'
import SuccessStatus from '../../_components/SuccessStatus'
import NarButton from '../../_design-system/NarButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import useDataStoreApi from '../../_hooks/useDataStoreApi'
import useEngineApi from '../../_hooks/useEngineApi'
import useStore from '../../_hooks/useStore'
import CodeEditor from './CodeEditor'
import SignAndPushForm from './forms/SignAndPushForm'
import EngineConfigModal from './modals/EngineConfigModal'
import Users from './sections/Users'
import Wallets from './sections/Wallets'

enum Action {
  FETCH_DATA_STORE = 'FETCH_DATA_STORE',
  SIGN_ENTITY = 'SIGN_ENTITY',
  SIGN_POLICY = 'SIGN_POLICY',
  PUSH_ENTITY = 'PUSH_ENTITY',
  PUSH_POLICY = 'PUSH_POLICY',
  PUSH_ENTITY_SIGNATURE = 'PUSH_ENTITY_SIGNATURE',
  PUSH_POLICY_SIGNATURE = 'PUSH_POLICY_SIGNATURE',
  SIGN_AND_PUSH_ENTITY = 'SIGN_AND_PUSH_ENTITY',
  SIGN_AND_PUSH_POLICY = 'SIGN_AND_PUSH_POLICY'
}

const DataStoreConfig = () => {
  const {
    engineUrl,
    engineClientId,
    engineClientSecret,
    entityDataStoreUrl,
    entitySignatureUrl,
    policyDataStoreUrl,
    policySignatureUrl,
    setEntityDataStoreUrl,
    setEntitySignatureUrl,
    setPolicyDataStoreUrl,
    setPolicySignatureUrl
  } = useStore()

  const {
    dataStore,
    entitySignature: savedEntitySignature,
    policySignature: savedPolicySignature,
    errors,
    validationErrors,
    getDataStore,
    signEntityData,
    pushEntityData,
    pushEntitySignature,
    signAndPushEntity,
    signPolicyData,
    pushPolicyData,
    pushPolicySignature,
    signAndPushPolicy
  } = useDataStoreApi()

  const { isSynced, syncEngine } = useEngineApi()

  const [isEntitySigning, setIsEntitySigning] = useState(false)
  const [isPolicySigning, setIsPolicySigning] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [entitySignature, setEntitySignature] = useState('')
  const [policySignature, setPolicySignature] = useState('')
  const [dataCodeEditor, setDataCodeEditor] = useState<string>()
  const [displayCodeEditor, setDisplayCodeEditor] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (!savedEntitySignature) return

    setEntitySignature(savedEntitySignature)
  }, [savedEntitySignature])

  useEffect(() => {
    if (!savedPolicySignature) return

    setPolicySignature(savedPolicySignature)
  }, [savedPolicySignature])

  useEffect(() => {
    if (!dataStore) return

    setDataCodeEditor(JSON.stringify(dataStore, null, 2))
  }, [dataStore])

  useEffect(() => {
    if (validationErrors && validationErrors.length > 0) {
      setIsDialogOpen(true)
    } else {
      setIsDialogOpen(false)
    }
  }, [validationErrors])

  const updateEntityStore = async (updatedData: Partial<Entities>) => {
    setDataCodeEditor((prev) => {
      const { entity, policy } = prev ? JSON.parse(prev) : { entity: {}, policy: {} }
      return JSON.stringify({ entity: { ...entity, ...updatedData }, policy }, null, 2)
    })
  }

  const handleAction = async (action: Action) => {
    if (!dataCodeEditor) return

    const { entity, policy } = JSON.parse(dataCodeEditor)
    const resyncEngine = () => syncEngine(engineUrl, engineClientId, engineClientSecret)

    switch (action) {
      case Action.FETCH_DATA_STORE:
        setIsFetching(true)
        await getDataStore()
        setIsFetching(false)
        break
      case Action.SIGN_AND_PUSH_ENTITY:
        setIsEntitySigning(true)
        await signAndPushEntity(entity)
        await resyncEngine()
        setIsEntitySigning(false)
        break
      case Action.SIGN_AND_PUSH_POLICY:
        setIsPolicySigning(true)
        await signAndPushPolicy(policy)
        await resyncEngine()
        setIsPolicySigning(false)
        break
      case Action.SIGN_ENTITY:
        await signEntityData(entity)
        break
      case Action.PUSH_ENTITY:
        await pushEntityData(entity)
        await resyncEngine()
        break
      case Action.SIGN_POLICY:
        await signPolicyData(policy)
        break
      case Action.PUSH_POLICY:
        await pushPolicyData(policy)
        await resyncEngine()
        break
      case Action.PUSH_ENTITY_SIGNATURE:
        await pushEntitySignature(entitySignature)
        await resyncEngine()
        break
      case Action.PUSH_POLICY_SIGNATURE:
        await pushPolicySignature(policySignature)
        await resyncEngine()
        break
      default:
        return
    }
  }

  return (
    <div className="flex flex-col gap-16">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Data Store</div>
        <div className="flex items-center gap-4">
          <ErrorStatus label={errors} />
          <SuccessStatus label={isSynced ? 'Engine Synced!' : ''} />
          <NarButton
            label={isEntitySigning ? 'Processing...' : 'Sign & Push Entity'}
            leftIcon={isEntitySigning ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
            onClick={() => handleAction(Action.SIGN_AND_PUSH_ENTITY)}
            disabled={isEntitySigning}
          />
          <NarButton
            label={isPolicySigning ? 'Processing...' : 'Sign & Push Policy'}
            leftIcon={isPolicySigning ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
            onClick={() => handleAction(Action.SIGN_AND_PUSH_POLICY)}
            disabled={isPolicySigning}
          />
          <NarButton
            label="Fetch"
            leftIcon={<FontAwesomeIcon icon={isFetching ? faSpinner : faRotateRight} spin={isFetching} />}
            onClick={() => handleAction(Action.FETCH_DATA_STORE)}
            disabled={isFetching}
          />
          <FontAwesomeIcon height="20" icon={faPipe} size="xl" />
          <NarButton
            variant="secondary"
            label={displayCodeEditor ? 'List View' : 'Code Editor View'}
            leftIcon={<FontAwesomeIcon icon={faArrowRightArrowLeft} size="lg" />}
            onClick={() => setDisplayCodeEditor((prev) => !prev)}
          />
          <EngineConfigModal />
        </div>
      </div>
      <div className="flex gap-20">
        <div className="flex flex-col gap-8 w-1/3">
          <SignAndPushForm
            label="Entity Data URL"
            value={entityDataStoreUrl}
            onChange={setEntityDataStoreUrl}
            onSign={() => handleAction(Action.SIGN_ENTITY)}
            onPush={() => handleAction(Action.PUSH_ENTITY)}
          />
          <SignAndPushForm
            label="Policy Data URL"
            value={policyDataStoreUrl}
            onChange={setPolicyDataStoreUrl}
            onSign={() => handleAction(Action.SIGN_POLICY)}
            onPush={() => handleAction(Action.PUSH_POLICY)}
          />
          <NarInput label="Entity Signature URL" value={entitySignatureUrl} onChange={setEntitySignatureUrl} />
          <SignAndPushForm
            label="Entity Signature"
            value={entitySignature}
            onChange={setEntitySignature}
            onPush={() => handleAction(Action.PUSH_ENTITY_SIGNATURE)}
          />
          <NarInput label="Policy Signature URL" value={policySignatureUrl} onChange={setPolicySignatureUrl} />
          <SignAndPushForm
            label="Policy Signature"
            value={policySignature}
            onChange={setPolicySignature}
            onPush={() => handleAction(Action.PUSH_POLICY_SIGNATURE)}
          />
        </div>
        <div className="flex flex-col gap-8 w-2/3">
          {displayCodeEditor && <CodeEditor value={dataCodeEditor} onChange={setDataCodeEditor} />}
          {!displayCodeEditor && (
            <>
              <Users
                users={dataCodeEditor ? JSON.parse(dataCodeEditor).entity.users : undefined}
                credentials={dataCodeEditor ? JSON.parse(dataCodeEditor).entity.credentials : undefined}
                userWallets={dataCodeEditor ? JSON.parse(dataCodeEditor).entity.userWallets : undefined}
                onChange={updateEntityStore}
              />
              <Wallets
                wallets={dataCodeEditor ? JSON.parse(dataCodeEditor).entity.wallets : undefined}
                userWallets={dataCodeEditor ? JSON.parse(dataCodeEditor).entity.userWallets : undefined}
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
          <div className="w-[650px] px-12 py-4">
            <p className="flex flex-col gap-1 text-nv-white text-nv-sm list-disc">{validationErrors}</p>
          </div>
        </NarDialog>
      )}
    </div>
  )
}

export default DataStoreConfig
