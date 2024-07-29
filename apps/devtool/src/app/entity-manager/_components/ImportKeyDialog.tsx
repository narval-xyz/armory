import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NarButton from "../../_design-system/NarButton";
import NarDialog from "../../_design-system/NarDialog";
import { faInfo, faInfoCircle, faUpload, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import ImportKeyForm, { KeyType } from "./ImportKeyForm";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import useAuthServerApi from "../../_hooks/useAuthServerApi";
import { v4 as uuid } from "uuid";
import { AccountEntity, AccountType, Action, Entities, getAddress, toHex } from "@narval/policy-engine-shared";
import { Permission } from "@narval/armory-sdk";
import useVaultApi from "../../_hooks/useVaultApi";
import { Hex } from "@narval/signature";
import Card from "./Card";
import Info from "./Info";
import Message from "./Message";

interface ImportKeyDialogProp {
  isOpen?: boolean,
  setEntities: Dispatch<SetStateAction<Entities>>
}

export default function ImportKeyDialog(props: ImportKeyDialogProp) {
  const { requestAccessToken } = useAuthServerApi()
  const { importAccount, importWallet } = useVaultApi()

  const [isOpen, setOpen] = useState(Boolean(props.isOpen))
  const [importKey, setImportKey] = useState<{ key: string, keyType: KeyType }>()
  const [errors, setErrors] = useState<string[]>([])

  const addError = (error: string) => setErrors((prev) => [...prev, error])

  const addAccount = (account: AccountEntity) => props.setEntities((prev) => ({
    ...prev,
    accounts: [...prev.accounts, account]
  }))

  const onSave = async () => {
    const accessToken = await requestAccessToken({
      action: Action.GRANT_PERMISSION,
      resourceId: 'vault',
      nonce: uuid(),
      permissions: [Permission.WALLET_IMPORT, Permission.WALLET_CREATE, Permission.WALLET_READ]
    })

    if (!accessToken) {
      addError('Unable to issue an access token')
    }

    if (accessToken && importKey) {
      if (importKey.keyType === KeyType.PRIVATE_KEY) {
        const account = await importAccount({
          privateKey: importKey.key as Hex,
          accessToken
        })

        if (account) {
          addAccount({
            address: getAddress(account.address),
            id: account.id,
            accountType: AccountType.EOA,
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
            accountType: AccountType.EOA,
          })
        }
      }
    }

    setOpen(false)
  }

  return (
    <NarDialog
      triggerButton={<NarButton label={"Import"} leftIcon={<FontAwesomeIcon icon={faUpload} />} />}
      title={"Import"}
      primaryButtonLabel={"Import"}
      isOpen={isOpen}
      onOpenChange={setOpen}
      onDismiss={() => setOpen(false)}
      onSave={onSave}
    >
      <div className="w-[650px] px-12 py-4">
        <ImportKeyForm setImportKey={setImportKey} />

        <Info text="Use to import accounts or wallets into the Armory Vault." />

        {errors.length > 0 && (
          <Message
            icon={faXmarkCircle}
            color="danger"
            className="mt-6"
          >
            {errors.join(', ')}
          </Message>
        )}
      </div>
    </NarDialog>
  )
}
