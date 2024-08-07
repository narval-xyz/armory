'use client'

import { faCheckCircle, faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GenerateKeyResponse, Permission } from '@narval/armory-sdk'
import { AccountType, Action, Entities, EntityUtil, hexSchema } from '@narval/policy-engine-shared'
import { Dispatch, FC, SetStateAction, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import ValueWithCopy from '../../../_components/ValueWithCopy'
import NarButton from '../../../_design-system/NarButton'
import NarDialog from '../../../_design-system/NarDialog'
import NarInput from '../../../_design-system/NarInput'
import useAuthServerApi from '../../../_hooks/useAuthServerApi'
import useVaultApi from '../../../_hooks/useVaultApi'

enum Steps {
  FORM,
  SUCCESS
}

interface GenerateWalletDialogProps {
  isOpen?: boolean
  setEntities: Dispatch<SetStateAction<Entities>>
}

const GenerateWalletDialog: FC<GenerateWalletDialogProps> = (props) => {
  const { generateWallet } = useVaultApi()
  const { requestAccessToken } = useAuthServerApi()

  const [currentStep, setCurrentStep] = useState<Steps>(Steps.FORM)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [keyId, setKeyId] = useState('')
  const [generatedWallet, setGeneratedWallet] = useState<GenerateKeyResponse>()

  const btnLabel = useMemo(() => {
    const labels: Record<number, string> = {
      [Steps.FORM]: 'Generate',
      [Steps.SUCCESS]: 'Confirm'
    }

    return labels[currentStep] || 'Processing...'
  }, [currentStep])

  const handleClose = () => {
    setIsDialogOpen(false)
    setGeneratedWallet(undefined)
    setKeyId('')
    setCurrentStep(Steps.FORM)
  }

  const handleSave = async () => {
    try {
      setIsProcessing(true)

      const accessToken = await requestAccessToken({
        action: Action.GRANT_PERMISSION,
        resourceId: 'vault',
        nonce: uuid(),
        permissions: [Permission.WALLET_CREATE]
      })

      if (accessToken) {
        const wallet = await generateWallet({
          accessToken,
          keyId
        })

        if (wallet) {
          setGeneratedWallet(wallet)

          props.setEntities((prev) =>
            EntityUtil.addAccount(prev, {
              id: wallet.account.id,
              address: hexSchema.parse(wallet.account.address),
              accountType: AccountType.EOA
            })
          )

          setCurrentStep(Steps.SUCCESS)
        }
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <NarDialog
      triggerButton={
        <NarButton label="Generate Wallet" variant="secondary" leftIcon={<FontAwesomeIcon icon={faWallet} />} />
      }
      title="Generate Wallet"
      primaryButtonLabel={btnLabel}
      isOpen={isDialogOpen}
      onOpenChange={(val) => (val ? setIsDialogOpen(val) : handleClose())}
      onDismiss={handleClose}
      onSave={handleSave}
      isSaving={isProcessing}
      isConfirm={currentStep === Steps.SUCCESS}
      isSaveDisabled={isProcessing}
    >
      <div className="w-[750px] px-12 py-4">
        {currentStep === Steps.FORM && (
          <div className="flex flex-col gap-[8px]">
            <div className="flex items-end gap-[8px]">
              <NarInput label="Key ID (optional)" value={keyId} onChange={setKeyId} />
            </div>
          </div>
        )}

        {currentStep === Steps.SUCCESS && (
          <div className="flex flex-col gap-[16px]">
            <div className="flex items-center gap-[8px]">
              <FontAwesomeIcon className="text-nv-green-500" icon={faCheckCircle} />
              <div className="text-nv-lg">Wallet generate successfully!</div>
            </div>
            {generatedWallet && (
              <div className="flex flex-col gap-[8px]">
                <ValueWithCopy layout="horizontal" label="Key ID" value={generatedWallet.keyId} />
                <ValueWithCopy layout="horizontal" label="Account ID" value={generatedWallet.account.id} />
                <ValueWithCopy layout="horizontal" label="Account Address" value={generatedWallet.account.address} />
                <ValueWithCopy
                  layout="horizontal"
                  label="Derivation Path"
                  value={generatedWallet.account.derivationPath}
                />
                <ValueWithCopy layout="horizontal" label="Backup" value={generatedWallet.backup} />
              </div>
            )}
            <p className="text-nv-lg">Save the wallet Key ID somewhere. You'll need it to derive accounts later.</p>
          </div>
        )}
      </div>
    </NarDialog>
  )
}

export default GenerateWalletDialog
