'use client'

import { SendEvaluationResponse, SignatureRequest } from '@narval/armory-sdk'
import { useEffect, useState } from 'react'
import Playground from '../../_components/Playground'
import EngineConfigModal from '../../_components/modals/EngineConfigModal'
import useEngineApi from '../../_hooks/useEngineApi'
import useVaultApi from '../../_hooks/useVaultApi'

const PolicyEnginePlayground = () => {
  const { errors: engineErrors, evaluate } = useEngineApi()
  const { errors: vaultErrors, sign, importPk, importSeedPhrase, generateWalletKeys, deriveWalletKey } = useVaultApi()
  const [errors, setErrors] = useState<string>()

  useEffect(() => {
    if (engineErrors) {
      setErrors(engineErrors)
    } else if (vaultErrors) {
      setErrors(vaultErrors)
    }
  }, [engineErrors, vaultErrors])

  const validateResponse = async (res: any): Promise<SignatureRequest | undefined> => {
    const response = SendEvaluationResponse.safeParse(res)

    if (!response.success || !response.data.accessToken || !response.data.request) {
      return undefined
    }

    const { accessToken, request } = response.data

    return { accessToken, request }
  }

  return (
    <Playground
      title="Policy Engine"
      configModal={<EngineConfigModal />}
      errors={errors}
      evaluate={evaluate}
      sign={sign}
      importPrivateKey={importPk}
      importSeedPhrase={importSeedPhrase}
      generateKey={generateWalletKeys}
      deriveWallet={deriveWalletKey}
      validateResponse={validateResponse}
    />
  )
}

export default PolicyEnginePlayground
