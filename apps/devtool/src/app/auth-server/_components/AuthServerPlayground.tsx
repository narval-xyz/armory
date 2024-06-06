'use client'

import { AuthorizationRequest, SignatureRequest } from '@narval/armory-sdk'
import { useEffect, useState } from 'react'
import Playground from '../../_components/Playground'
import AuthConfigModal from '../../_components/modals/AuthConfigModal'
import useAuthServerApi from '../../_hooks/useAuthServerApi'
import useVaultApi from '../../_hooks/useVaultApi'

const AuthServerPlayground = () => {
  const { errors: authErrors, authorizationResponse, authorize } = useAuthServerApi()
  const { errors: vaultErrors, sign, importPk, importSeedPhrase, generateWalletKeys, deriveWalletKey } = useVaultApi()
  const [errors, setErrors] = useState<string>()

  useEffect(() => {
    if (authErrors) {
      setErrors(authErrors)
    } else if (vaultErrors) {
      setErrors(vaultErrors)
    }
  }, [authErrors, vaultErrors])

  const validateResponse = async (res: any): Promise<SignatureRequest | undefined> => {
    const response = AuthorizationRequest.safeParse(res)

    if (!response.success || !response.data.evaluations[0]?.signature) {
      return undefined
    }

    const accessToken = { value: response.data.evaluations[0]?.signature }

    const { request } = response.data

    return { accessToken, request }
  }

  return (
    <Playground
      title="Authorization Server"
      configModal={<AuthConfigModal />}
      errors={errors}
      response={authorizationResponse ? JSON.stringify(authorizationResponse, null, 2) : undefined}
      authorize={authorize}
      sign={sign}
      importPrivateKey={importPk}
      importSeedPhrase={importSeedPhrase}
      generateKey={generateWalletKeys}
      deriveWallet={deriveWalletKey}
      validateResponse={validateResponse}
    />
  )
}

export default AuthServerPlayground
