'use client'

import { faRotateRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import ErrorStatus from '../../_components/ErrorStatus'
import SuccessStatus from '../../_components/SuccessStatus'
import ValueWithCopy from '../../_components/ValueWithCopy'
import AddUserModal from '../../_components/modals/AddUserModal'
import DataStoreConfigModal from '../../_components/modals/DataStoreConfigModal'
import NarButton from '../../_design-system/NarButton'
import NarDialog from '../../_design-system/NarDialog'
import useAuthServerApi from '../../_hooks/useAuthServerApi'
import useDataStoreApi from '../../_hooks/useDataStoreApi'
import useEngineApi from '../../_hooks/useEngineApi'
import useStore from '../../_hooks/useStore'
import DataEditor from './DataEditor'

const DataStore = () => {
  const {
    useAuthServer,
    authClientId,
    engineClientId,
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
      isSigningAndPushingPolicy,
      entityFetchError,
      policyFetchError
    },
    getEntityStore,
    getPolicyStore,
    signEntityData,
    signPolicyData,
    signAndPushEntity,
    signAndPushPolicy,
    pageError,
    policyError,
    entityError,
    validationErrors
  } = useDataStoreApi()

  const { sync: syncAuthServer, isProcessing: isAuthServerSyncing, isSynced: isAuthServerSynced } = useAuthServerApi()
  const { sync: syncEngine, isProcessing: isEngineSyncing, isSynced: isEngineSynced } = useEngineApi()

  const [domLoaded, setDomLoaded] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => setDomLoaded(true), [])
  useEffect(() => setIsDialogOpen(Boolean(validationErrors && validationErrors.length > 0)), [validationErrors])

  const isSyncing = isAuthServerSyncing || isEngineSyncing

  if (!domLoaded) return null

  return (
    <div className="flex flex-col gap-[32px] h-full">
      <div className="flex flex-col gap-[4px]">
        <div className="flex items-center">
          <div className="text-nv-2xl grow">Data Store</div>
          <div className="flex items-center gap-[8px]">
            <SuccessStatus label={isAuthServerSynced || isEngineSynced ? 'Engine synced!' : ''} />
            <ErrorStatus label={pageError} />
            <AddUserModal />
            <NarButton
              label="Sync"
              leftIcon={<FontAwesomeIcon icon={faRotateRight} spin={isSyncing} />}
              onClick={useAuthServer ? syncAuthServer : syncEngine}
              disabled={isSyncing}
            />
            <DataStoreConfigModal />
          </div>
        </div>
        {useAuthServer && <ValueWithCopy layout="horizontal" label="Auth Client ID" value={authClientId} />}
        {!useAuthServer && <ValueWithCopy layout="horizontal" label="Engine Client ID" value={engineClientId} />}
      </div>
      <div className="grid grid-cols-2 gap-[32px] grow">
        <DataEditor
          label="Entity Data URL"
          data={entityStore}
          url={entityDataStoreUrl}
          isFetching={isFetchingEntity}
          isSigning={isSigningEntity}
          isSigningAndPushing={isSigningAndPushingEntity}
          error={entityFetchError}
          errorMessage={entityError}
          fetch={getEntityStore}
          setUrl={setEntityDataStoreUrl}
          sign={signEntityData}
          signAndPush={signAndPushEntity}
        />
        <DataEditor
          label="Policy Data URL"
          data={policyStore}
          url={policyDataStoreUrl}
          isFetching={isFetchingPolicy}
          isSigning={isSigningPolicy}
          isSigningAndPushing={isSigningAndPushingPolicy}
          error={policyFetchError}
          errorMessage={policyError}
          fetch={getPolicyStore}
          setUrl={setPolicyDataStoreUrl}
          sign={signPolicyData}
          signAndPush={signAndPushPolicy}
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

export default DataStore
