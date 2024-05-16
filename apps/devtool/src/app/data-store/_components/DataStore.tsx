'use client'

import { useEffect, useState } from 'react'
import ErrorStatus from '../../_components/ErrorStatus'
import SuccessStatus from '../../_components/SuccessStatus'
import NarDialog from '../../_design-system/NarDialog'
import useDataStoreApi from '../../_hooks/useDataStoreApi'
import useEngineApi from '../../_hooks/useEngineApi'
import useStore from '../../_hooks/useStore'
import DataEditor from './DataEditor'
import EngineConfigModal from './DataStoreConfigModal'

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
    signAndPushPolicy,
    errors,
    validationErrors
  } = useDataStoreApi()

  const { isSynced, syncEngine } = useEngineApi()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => setIsDialogOpen(Boolean(validationErrors && validationErrors.length > 0)), [validationErrors])

  const resyncEngine = () => syncEngine(engineUrl, engineClientId, engineClientSecret)

  return (
    <div className="flex flex-col gap-[48px] h-full">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Data Store</div>
        <div className="flex items-center gap-[8px]">
          <ErrorStatus label={errors} />
          <SuccessStatus label={isSynced ? 'Engine Synced!' : ''} />
          <EngineConfigModal />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[32px] grow">
        <DataEditor
          data={entityStore}
          url={entityDataStoreUrl}
          setUrl={setEntityDataStoreUrl}
          isFetching={isFetchingEntity}
          fetch={getEntityStore}
          isSigning={isSigningEntity}
          sign={signEntityData}
          isSigningAndPushing={isSigningAndPushingEntity}
          signAndPush={signAndPushEntity}
          resyncEngine={resyncEngine}
        />
        <DataEditor
          data={policyStore}
          url={policyDataStoreUrl}
          setUrl={setPolicyDataStoreUrl}
          isFetching={isFetchingPolicy}
          fetch={getPolicyStore}
          isSigning={isSigningPolicy}
          sign={signPolicyData}
          isSigningAndPushing={isSigningAndPushingPolicy}
          signAndPush={signAndPushPolicy}
          resyncEngine={resyncEngine}
        />
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
