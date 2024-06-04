'use client'

import { AuthorizationRequest, SignatureRequest } from '@narval/armory-sdk'
import { useEffect, useState } from 'react'
import Playground from '../../_components/Playground'
import useAuthServerApi from '../../_hooks/useAuthServerApi'
import useVaultApi from '../../_hooks/useVaultApi'

const AuthServerPlayground = () => {
  const { errors: evaluationErrors, authorizationResponse, authorize } = useAuthServerApi()
  const { errors: signatureErrors, sign, importPk, importSeedPhrase } = useVaultApi()

  const [errors, setErrors] = useState<string>()

  useEffect(() => {
    if (evaluationErrors) {
      setErrors(evaluationErrors)
    } else if (signatureErrors) {
      setErrors(signatureErrors)
    }
  }, [evaluationErrors, signatureErrors])

  const validateResponse = async (res: any): Promise<SignatureRequest | undefined> => {
    const response = AuthorizationRequest.safeParse(res)

    if (!response.success || !response.data.evaluations[0].signature) {
      return undefined
    }

    const accessToken = { value: response.data.evaluations[0].signature }
    const { request } = response.data

    return { accessToken, request }
  }

  return (
    <Playground
      title="Authorization Server"
      errors={errors}
      response={authorizationResponse ? JSON.stringify(authorizationResponse, null, 2) : undefined}
      authorize={authorize}
      sign={sign}
      importPrivateKey={importPk}
      importSeedPhrase={importSeedPhrase}
      validateResponse={validateResponse}
    />
  )
}

export default AuthServerPlayground
