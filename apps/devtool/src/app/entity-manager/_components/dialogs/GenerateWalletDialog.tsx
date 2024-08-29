'use client'

import { faCheckCircle, faWallet, faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  AccountType,
  Action,
  Entities,
  EntityUtil,
  GenerateKeyResponse,
  Permission,
  hexSchema
} from '@narval/armory-sdk'
import { Dispatch, FC, SetStateAction, useMemo, useState } from 'react'
import { v4 as uuid } from 'uuid'
import ValueWithCopy from '../../../_components/ValueWithCopy'
import NarButton from '../../../_design-system/NarButton'
import NarDialog from '../../../_design-system/NarDialog'
import NarInput from '../../../_design-system/NarInput'
import useAuthServerApi from '../../../_hooks/useAuthServerApi'
import useVaultApi from '../../../_hooks/useVaultApi'
import { extractErrorMessage } from '../../../_lib/utils'
import Message from '../Message'

enum Steps {
  FORM,
  SUCCESS
}

interface GenerateWalletDialogProps {
  setEntities: Dispatch<SetStateAction<Entities>>
}

const GenerateWalletDialog: FC<GenerateWalletDialogProps> = ({ setEntities }) => {
  const { generateWallet } = useVaultApi()
  const { requestAccessToken } = useAuthServerApi()

  const [currentStep, setCurrentStep] = useState<Steps>(Steps.FORM)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [keyId, setKeyId] = useState('')
  const [generatedWallet, setGeneratedWallet] = useState<GenerateKeyResponse>()
  const [errors, setErrors] = useState<string[]>([])

  const addError = (error: string) => setErrors((prev) => [...prev, error])

  const handleClose = () => {
    setIsDialogOpen(false)
    setGeneratedWallet(undefined)
    setKeyId('')
    setErrors([])
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

      if (!accessToken) {
        addError('Unable to issue an access token')
        return
      }

      const wallet = await generateWallet({
        accessToken,
        keyId
      })

      if (wallet) {
        setGeneratedWallet(wallet)

        setEntities((prev) =>
          EntityUtil.addAccount(prev, {
            id: wallet.account.id,
            address: hexSchema.parse(wallet.account.address),
            accountType: AccountType.EOA
          })
        )

        setCurrentStep(Steps.SUCCESS)
      }
    } catch (error) {
      addError(extractErrorMessage(error))
    } finally {
      setIsProcessing(false)
    }
  }

  const btnLabel = useMemo(() => {
    const labels: Record<number, string> = {
      [Steps.FORM]: 'Generate',
      [Steps.SUCCESS]: 'Confirm'
    }

    return labels[currentStep] || 'Processing...'
  }, [currentStep])

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

        {errors.length > 0 && (
          <Message icon={faXmarkCircle} color="danger" className="mt-6">
            {errors.join(', ')}
          </Message>
        )}
      </div>
    </NarDialog>
  )
}

export default GenerateWalletDialog
