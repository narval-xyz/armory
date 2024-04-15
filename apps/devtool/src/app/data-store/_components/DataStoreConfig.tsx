'use client'

import { faArrowRightArrowLeft, faPipe, faSpinner } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Entities } from '@narval/policy-engine-shared'
import { useEffect, useState } from 'react'
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
  const {
    entityDataStoreUrl,
    entitySignatureUrl,
    policyDataStoreUrl,
    policySignatureUrl,
    setEntityDataStoreUrl,
    setEntitySignatureUrl,
    setPolicyDataStoreUrl,
    setPolicySignatureUrl
  } = useStore()

  const { isSynced, syncEngine } = useEngineApi()

  const { dataStore, isEntitySigning, isPolicySigning, errors, signEntityDataStore, signPolicyDataStore } =
    useDataStoreApi()

  const [codeEditor, setCodeEditor] = useState<string>()
  const [displayCodeEditor, setDisplayCodeEditor] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (!dataStore) return

    const { entity, policy } = dataStore
    setCodeEditor(JSON.stringify({ entity: entity.data, policy: policy.data }, null, 2))
  }, [dataStore])

  useEffect(() => {
    if (errors && (errors as string[]).length > 0) {
      setIsDialogOpen(true)
    } else {
      setIsDialogOpen(false)
    }
  }, [errors])

  const signEntityData = async () => {
    if (!codeEditor) return

    const { entity } = JSON.parse(codeEditor)
    await signEntityDataStore(entity)
    await syncEngine()
  }

  const signPolicyData = async () => {
    if (!codeEditor) return

    const { policy } = JSON.parse(codeEditor)
    await signPolicyDataStore(policy)
    await syncEngine()
  }

  const updateEntityStore = async (updatedData: Partial<Entities>) => {
    setCodeEditor((prev) => {
      const { entity, policy } = prev ? JSON.parse(prev) : { entity: {}, policy: {} }
      return JSON.stringify({ entity: { ...entity, ...updatedData }, policy }, null, 2)
    })
  }

  return (
    <div className="flex flex-col gap-20">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Data Store</div>
        <div className="flex items-center gap-4">
          <GreenCheckStatus isChecked={isSynced} label={isSynced ? 'Engine Synced!' : 'Syncing Engine...'} />
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
          <div className="px-12 py-4">
            <ul className="flex flex-col gap-1 text-nv-white text-nv-sm list-disc">
              {(errors as string[]).map((error, index) => (
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
