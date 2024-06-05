'use client'

import { faArrowRightArrowLeft } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import ErrorStatus from '../../_components/ErrorStatus'
import SuccessStatus from '../../_components/SuccessStatus'
import ValueWithCopy from '../../_components/ValueWithCopy'
import AddUserModal from '../../_components/modals/AddUserModal'
import NarButton from '../../_design-system/NarButton'
import NarDialog from '../../_design-system/NarDialog'
import useDataStoreApi from '../../_hooks/useDataStoreApi'
import useEngineApi from '../../_hooks/useEngineApi'
import useStore from '../../_hooks/useStore'
import DataEditor from './DataEditor'
import DataStoreConfigModal from './DataStoreConfigModal'

enum Action {
  FETCH_ENTITY = 'FETCH_ENTITY',
  FETCH_POLICY = 'FETCH_POLICY',
  SIGN_ENTITY = 'SIGN_ENTITY',
  SIGN_POLICY = 'SIGN_POLICY',
  SIGN_AND_PUSH_ENTITY = 'SIGN_AND_PUSH_ENTITY',
  SIGN_AND_PUSH_POLICY = 'SIGN_AND_PUSH_POLICY'
}

const DataStore = () => {
  const { engineClientId, entityDataStoreUrl, policyDataStoreUrl, setEntityDataStoreUrl, setPolicyDataStoreUrl } =
    useStore()

  const {
    entityStore,
    policyStore,
    isUsingManagedDataStore,
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
    switchDataStore,
    errors,
    validationErrors
  } = useDataStoreApi()

  const { isSynced, sync } = useEngineApi()

  const [domLoaded, setDomLoaded] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => setDomLoaded(true), [])
  useEffect(() => setIsDialogOpen(Boolean(validationErrors && validationErrors.length > 0)), [validationErrors])

  if (!domLoaded) return null

  return (
    <div className="flex flex-col gap-[32px] h-full">
      <div className="flex flex-col gap-[4px]">
        <div className="flex items-center">
          <div className="text-nv-2xl grow">Data Store</div>
          <div className="flex items-center gap-[8px]">
            <ErrorStatus label={errors} />
            <SuccessStatus label={isSynced ? 'Engine Synced!' : ''} />
            <AddUserModal />
            <NarButton
              variant="secondary"
              label={`Use ${isUsingManagedDataStore ? 'Local Data Store' : 'Managed Data Store'}`}
              leftIcon={<FontAwesomeIcon icon={faArrowRightArrowLeft} />}
              onClick={switchDataStore}
            />
            <DataStoreConfigModal />
          </div>
        </div>
        <ValueWithCopy layout="horizontal" label="Engine Client ID" value={engineClientId} />
      </div>
      <div className="grid grid-cols-2 gap-[32px] grow">
        <DataEditor
          label="Entity Data URL"
          data={entityStore}
          url={entityDataStoreUrl}
          setUrl={setEntityDataStoreUrl}
          isFetching={isFetchingEntity}
          fetch={getEntityStore}
          isSigning={isSigningEntity}
          sign={signEntityData}
          isSigningAndPushing={isSigningAndPushingEntity}
          signAndPush={signAndPushEntity}
          resyncEngine={sync}
        />
        <DataEditor
          label="Policy Data URL"
          data={policyStore}
          url={policyDataStoreUrl}
          setUrl={setPolicyDataStoreUrl}
          isFetching={isFetchingPolicy}
          fetch={getPolicyStore}
          isSigning={isSigningPolicy}
          sign={signPolicyData}
          isSigningAndPushing={isSigningAndPushingPolicy}
          signAndPush={signAndPushPolicy}
          resyncEngine={sync}
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
