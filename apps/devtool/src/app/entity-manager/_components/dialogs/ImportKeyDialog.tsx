'use client'

import { faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
import { AccountEntity, AccountType, Action, Entities, Hex, Permission, getAddress } from '@narval/armory-sdk'
import { Dispatch, SetStateAction, useState } from 'react'
import { v4 as uuid } from 'uuid'
import NarButton from '../../../_design-system/NarButton'
import NarDialog from '../../../_design-system/NarDialog'
import useAuthServerApi from '../../../_hooks/useAuthServerApi'
import useVaultApi from '../../../_hooks/useVaultApi'
import { ensurePrefix, extractErrorMessage } from '../../../_lib/utils'
import Info from '../Info'
import Message from '../Message'
import ImportKeyForm, { KeyType } from '../forms/ImportKeyForm'

interface ImportKeyDialogProp {
  triggerButton?: React.ReactNode
  setEntities: Dispatch<SetStateAction<Entities>>
}

export default function ImportKeyDialog({ triggerButton, setEntities }: ImportKeyDialogProp) {
  const { requestAccessToken } = useAuthServerApi()
  const { importAccount, importWallet } = useVaultApi()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importKey, setImportKey] = useState<{ key: string; keyType: KeyType }>()
  const [errors, setErrors] = useState<string[]>([])

  const addError = (error: string) => setErrors((prev) => [...prev, error])

  const handleClose = () => {
    setIsDialogOpen(false)
    setImportKey(undefined)
    setIsProcessing(false)
    setErrors([])
  }

  const addAccount = (account: AccountEntity) =>
    setEntities((prev) => ({
      ...prev,
      accounts: [...prev.accounts, account]
    }))

  const onSave = async () => {
    try {
      setIsProcessing(true)

      if (!importKey) {
        addError('Key is required')
        return
      }

      const accessToken = await requestAccessToken({
        action: Action.GRANT_PERMISSION,
        resourceId: 'vault',
        nonce: uuid(),
        permissions: [Permission.WALLET_IMPORT, Permission.WALLET_CREATE]
      })

      if (!accessToken) {
        addError('Unable to issue an access token')
        return
      }

      if (importKey.keyType === KeyType.PRIVATE_KEY) {
        const account = await importAccount({
          privateKey: ensurePrefix<Hex>(importKey.key, '0x'),
          accessToken
        })

        if (account) {
          addAccount({
            address: getAddress(account.address),
            id: account.id,
            accountType: AccountType.EOA
          })
        }
      }

      if (importKey.keyType === KeyType.SEED_PHRASE) {
        const wallet = await importWallet({
          seed: importKey.key,
          accessToken
        })

        if (wallet) {
          addAccount({
            address: getAddress(wallet.account.address),
            id: wallet.account.id,
            accountType: AccountType.EOA
          })
        }
      }

      handleClose()
    } catch (error) {
      addError(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <NarDialog
      triggerButton={triggerButton || <NarButton label="Import" />}
      title="Import Account"
      primaryButtonLabel="Import"
      isOpen={isDialogOpen}
      onOpenChange={(val) => (val ? setIsDialogOpen(val) : handleClose())}
      onDismiss={handleClose}
      onSave={onSave}
      isSaving={isProcessing}
      isSaveDisabled={isProcessing}
    >
      <div className="w-[650px] px-12 py-4">
        <ImportKeyForm setImportKey={setImportKey} />

        <Info text="Use to import accounts or wallets into the Armory Vault." />

        {errors.length > 0 && (
          <Message icon={faXmarkCircle} color="danger" className="mt-6">
            {errors.join(', ')}
          </Message>
        )}
      </div>
    </NarDialog>
  )
}
