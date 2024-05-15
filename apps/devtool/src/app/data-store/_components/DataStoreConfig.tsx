'use client'

import { faPen, faRotateRight, faSpinner } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import ErrorStatus from '../../_components/ErrorStatus'
import SuccessStatus from '../../_components/SuccessStatus'
import NarButton from '../../_design-system/NarButton'
import NarCopyButton from '../../_design-system/NarCopyButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import useDataStoreApi from '../../_hooks/useDataStoreApi'
import useEngineApi from '../../_hooks/useEngineApi'
import useStore from '../../_hooks/useStore'
import CodeEditor from './CodeEditor'
import EngineConfigModal from './modals/EngineConfigModal'

enum Action {
  FETCH_ENTITY = 'FETCH_ENTITY',
  FETCH_POLICY = 'FETCH_POLICY',
  SIGN_ENTITY = 'SIGN_ENTITY',
  SIGN_POLICY = 'SIGN_POLICY',
  SIGN_AND_PUSH_ENTITY = 'SIGN_AND_PUSH_ENTITY',
  SIGN_AND_PUSH_POLICY = 'SIGN_AND_PUSH_POLICY'
}

const DataStoreConfig = () => {
  const {
    engineUrl,
    engineClientId,
    engineClientSecret,
    entityDataStoreUrl,
    policyDataStoreUrl,
    setEntityDataStoreUrl,
    setPolicyDataStoreUrl
  } = useStore()

  const {
    entityStore,
    policyStore,
    errors,
    validationErrors,
    processingStatus: {
      isFetchingEntity,
      isFetchingPolicy,
      isSigningEntity,
      isSigningPolicy,
      isSigningAndPushingEntity,
      isSigningAndPushingPolicy
    },
    getEntityStore,
    getPolicyStore,
    signEntityData,
    signPolicyData,
    signAndPushEntity,
    signAndPushPolicy
  } = useDataStoreApi()

  const { isSynced, syncEngine } = useEngineApi()

  const [entityEditor, setEntityEditor] = useState<string>()
  const [policyEditor, setPolicyEditor] = useState<string>()
  const [isEntityEditorReadOnly, setIsEntityEditorReadOnly] = useState(true)
  const [isPolicyEditorReadOnly, setIsPolicyEditorReadOnly] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (!entityStore) return

    setEntityEditor(JSON.stringify(entityStore, null, 2))
  }, [entityStore])

  useEffect(() => {
    if (!policyStore) return

    setPolicyEditor(JSON.stringify(policyStore, null, 2))
  }, [policyStore])

  useEffect(() => {
    if (validationErrors && validationErrors.length > 0) {
      setIsDialogOpen(true)
    } else {
      setIsDialogOpen(false)
    }
  }, [validationErrors])

  const resyncEngine = () => syncEngine(engineUrl, engineClientId, engineClientSecret)

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Data Store</div>
        <div className="flex items-center gap-[4px]">
          <ErrorStatus label={errors} />
          <SuccessStatus label={isSynced ? 'Engine Synced!' : ''} />
          <EngineConfigModal />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[16px]">
        <div className="flex flex-col gap-[16px] w-full">
          <div className="flex items-end gap-[8px]">
            <NarInput label="Entity Data URL" value={entityDataStoreUrl} onChange={setEntityDataStoreUrl} />
            {isEntityEditorReadOnly ? (
              <>
                <NarCopyButton label="Copy JSON" copy={entityEditor || ''} />
                <NarButton
                  label="Edit"
                  leftIcon={<FontAwesomeIcon icon={faPen} />}
                  onClick={() => {
                    setIsEntityEditorReadOnly((prev) => !prev)
                    const editor = entityEditor ? JSON.parse(entityEditor) : { data: {} }
                    setEntityEditor(JSON.stringify(editor.data, null, 2))
                  }}
                />
              </>
            ) : (
              <NarButton
                label="Fetch"
                leftIcon={
                  <FontAwesomeIcon icon={isFetchingEntity ? faSpinner : faRotateRight} spin={isFetchingEntity} />
                }
                onClick={async () => {
                  await getEntityStore()
                  setIsEntityEditorReadOnly((prev) => !prev)
                }}
                disabled={isFetchingEntity}
              />
            )}
          </div>
          <CodeEditor value={entityEditor} readOnly={isEntityEditorReadOnly} onChange={setEntityEditor} />
          {!isEntityEditorReadOnly && (
            <div className="flex flex-row-reverse gap-[8px]">
              <NarButton
                label="Sign"
                leftIcon={isSigningEntity ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
                onClick={async () => {
                  if (!entityEditor) return
                  const entity = JSON.parse(entityEditor)
                  await signEntityData(entity)
                  await getEntityStore()
                  setIsEntityEditorReadOnly((prev) => !prev)
                }}
                disabled={isSigningEntity}
              />
              <NarButton
                label="Sign & Push"
                leftIcon={isSigningAndPushingEntity ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
                onClick={async () => {
                  if (!entityEditor) return
                  const entity = JSON.parse(entityEditor)
                  await signAndPushEntity(entity)
                  await getEntityStore()
                  setIsEntityEditorReadOnly((prev) => !prev)
                }}
                disabled={isSigningAndPushingEntity}
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-[16px] w-full">
          <div className="flex items-end gap-[8px]">
            <NarInput label="Policy Data URL" value={policyDataStoreUrl} onChange={setPolicyDataStoreUrl} />
            {isPolicyEditorReadOnly ? (
              <>
                <NarCopyButton label="Copy JSON" copy={policyEditor || ''} />
                <NarButton
                  label="Edit"
                  leftIcon={<FontAwesomeIcon icon={faPen} />}
                  onClick={() => {
                    setIsPolicyEditorReadOnly((prev) => !prev)
                    const editor = policyEditor ? JSON.parse(policyEditor) : { data: [] }
                    setPolicyEditor(JSON.stringify(editor.data, null, 2))
                  }}
                />
              </>
            ) : (
              <NarButton
                label="Fetch"
                leftIcon={
                  <FontAwesomeIcon icon={isFetchingPolicy ? faSpinner : faRotateRight} spin={isFetchingPolicy} />
                }
                onClick={async () => {
                  await getPolicyStore()
                  setIsPolicyEditorReadOnly((prev) => !prev)
                }}
                disabled={isFetchingPolicy}
              />
            )}
          </div>
          <CodeEditor value={policyEditor} readOnly={isPolicyEditorReadOnly} onChange={setPolicyEditor} />
          {!isPolicyEditorReadOnly && (
            <div className="flex flex-row-reverse gap-[8px]">
              <NarButton
                label="Sign"
                leftIcon={isSigningPolicy ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
                onClick={async () => {
                  if (!policyEditor) return
                  const policy = JSON.parse(policyEditor)
                  await signPolicyData(policy)
                  await getPolicyStore()
                  setIsPolicyEditorReadOnly((prev) => !prev)
                }}
                disabled={isSigningPolicy}
              />
              <NarButton
                label="Sign & Push"
                leftIcon={isSigningAndPushingPolicy ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
                onClick={async () => {
                  if (!policyEditor) return
                  const policy = JSON.parse(policyEditor)
                  await signAndPushPolicy(policy)
                  await getPolicyStore()
                  setIsPolicyEditorReadOnly((prev) => !prev)
                }}
                disabled={isSigningAndPushingPolicy}
              />
            </div>
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
