'use client'

import { faArrowRightArrowLeft, faPipe, faSpinner } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Entities } from '@narval/policy-engine-shared'
import { useEffect, useState } from 'react'
import ErrorStatus from '../../_components/ErrorStatus'
import GreenCheckStatus from '../../_components/GreenCheckStatus'
import NarButton from '../../_design-system/NarButton'
import NarDialog from '../../_design-system/NarDialog'
import NarInput from '../../_design-system/NarInput'
import useDataStoreApi from '../../_hooks/useDataStoreApi'
import useEngineApi from '../../_hooks/useEngineApi'
import useStore from '../../_hooks/useStore'
import CodeEditor from './CodeEditor'
import Users from './sections/Users'
import Wallets from './sections/Wallets'

const DataStoreConfig = () => {
  const { entityDataStoreUrl, policyDataStoreUrl, setEntityDataStoreUrl, setPolicyDataStoreUrl } = useStore()

  const { isSynced, syncEngine } = useEngineApi()

  const {
    dataStore,
    isEntitySigning,
    isPolicySigning,
    errors,
    validationErrors,
    signEntityDataStore,
    signPolicyDataStore
  } = useDataStoreApi()

  const [codeEditor, setCodeEditor] = useState<string>()
  const [displayCodeEditor, setDisplayCodeEditor] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (!dataStore) return

    setCodeEditor(JSON.stringify(dataStore, null, 2))
  }, [dataStore])

  useEffect(() => {
    if (validationErrors && validationErrors.length > 0) {
      setIsDialogOpen(true)
    } else {
      setIsDialogOpen(false)
    }
  }, [validationErrors])

  const signEntityData = async () => {
    if (!codeEditor) return
    const { entity } = JSON.parse(codeEditor)
    return signEntityDataStore(entity, syncEngine)
  }

  const signPolicyData = async () => {
    if (!codeEditor) return
    const { policy } = JSON.parse(codeEditor)
    return signPolicyDataStore(policy, syncEngine)
  }

  const updateEntityStore = async (updatedData: Partial<Entities>) => {
    setCodeEditor((prev) => {
      const { entity, policy } = prev ? JSON.parse(prev) : { entity: {}, policy: {} }
      return JSON.stringify({ entity: { ...entity, ...updatedData }, policy }, null, 2)
    })
  }

  return (
    <div className="flex flex-col gap-16">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Data Store</div>
        <div className="flex items-center gap-4">
          <ErrorStatus label={errors} />
          <GreenCheckStatus isChecked={isSynced} label={isSynced ? 'Engine Synced!' : 'Syncing Engine...'} />
          <NarButton
            label={isEntitySigning ? 'Signing...' : 'Sign Entity'}
            leftIcon={isEntitySigning ? <FontAwesomeIcon icon={faSpinner} spin /> : undefined}
            onClick={signEntityData}
            disabled={isEntitySigning}
          />
          <NarButton
            label={isPolicySigning ? 'Signing...' : 'Sign Policy'}
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
          <NarInput label="Policy Data URL" value={policyDataStoreUrl} onChange={setPolicyDataStoreUrl} />
        </div>
        <div className="flex flex-col gap-8 w-2/3">
          {displayCodeEditor && <CodeEditor value={codeEditor} onChange={setCodeEditor} />}
          {!displayCodeEditor && (
            <>
              <Users
                users={codeEditor ? JSON.parse(codeEditor).entity.users : undefined}
                credentials={codeEditor ? JSON.parse(codeEditor).entity.credentials : undefined}
                userWallets={codeEditor ? JSON.parse(codeEditor).entity.userWallets : undefined}
                onChange={updateEntityStore}
              />
              <Wallets
                wallets={codeEditor ? JSON.parse(codeEditor).entity.wallets : undefined}
                userWallets={codeEditor ? JSON.parse(codeEditor).entity.userWallets : undefined}
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
