import { faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
import { Permission } from '@narval/armory-sdk'
import { AccountEntity, AccountType, Action, Entities, getAddress } from '@narval/policy-engine-shared'
import { Hex } from '@narval/signature'
import { Dispatch, SetStateAction, useState } from 'react'
import { v4 as uuid } from 'uuid'
import NarButton from '../../../_design-system/NarButton'
import NarDialog from '../../../_design-system/NarDialog'
import useAuthServerApi from '../../../_hooks/useAuthServerApi'
import useVaultApi from '../../../_hooks/useVaultApi'
import { ensurePrefix } from '../../../_lib/utils'
import Info from '../Info'
import Message from '../Message'
import ImportKeyForm, { KeyType } from '../forms/ImportKeyForm'

interface ImportKeyDialogProp {
  isOpen?: boolean
  setEntities: Dispatch<SetStateAction<Entities>>
  onDismiss: () => void
  onOpenChange: (isOpen: boolean) => void
  onSave: () => void
}

export default function ImportKeyDialog(props: ImportKeyDialogProp) {
  const { requestAccessToken } = useAuthServerApi()
  const { importAccount, importWallet } = useVaultApi()

  const [importKey, setImportKey] = useState<{ key: string; keyType: KeyType }>()
  const [isSaving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const addError = (error: string) => setErrors((prev) => [...prev, error])

  const addAccount = (account: AccountEntity) =>
    props.setEntities((prev) => ({
      ...prev,
      accounts: [...prev.accounts, account]
    }))

  const onSave = async () => {
    try {
      setSaving(true)

      const accessToken = await requestAccessToken({
        action: Action.GRANT_PERMISSION,
        resourceId: 'vault',
        nonce: uuid(),
        permissions: [Permission.WALLET_IMPORT, Permission.WALLET_CREATE]
      })

      if (!accessToken) {
        addError('Unable to issue an access token')
      }

      if (accessToken && importKey) {
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
      }

      props.onSave()
    } finally {
      setSaving(false)
    }
  }

  return (
    <NarDialog
      triggerButton={<NarButton label={'Import'} />}
      title={'Import Account'}
      primaryButtonLabel={'Import'}
      isOpen={Boolean(props.isOpen)}
      onOpenChange={props.onOpenChange}
      onDismiss={props.onDismiss}
      onSave={onSave}
      isSaving={isSaving}
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
