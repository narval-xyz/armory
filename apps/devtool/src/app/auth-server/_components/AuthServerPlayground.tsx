'use client'

import { useEffect, useState } from 'react'
import Playground from '../../_components/Playground'
import useAuthServerApi from '../../_hooks/useAuthServerApi'
import useVaultApi from '../../_hooks/useVaultApi'

const AuthServerPlayground = () => {
  const { errors: evaluationErrors, authorizationResponse, authorize } = useAuthServerApi()
  const { errors: signatureErrors, sign, importPk } = useVaultApi()

  const [errors, setErrors] = useState<string>()

  useEffect(() => {
    if (evaluationErrors) {
      setErrors(evaluationErrors)
    } else if (signatureErrors) {
      setErrors(signatureErrors)
    }
  }, [evaluationErrors, signatureErrors])

  return (
    <Playground
      title="Authorization Server"
      errors={errors}
      response={authorizationResponse ? JSON.stringify(authorizationResponse, null, 2) : undefined}
      authorize={authorize}
      sign={sign}
      importPk={importPk}
    />
  )
}

export default AuthServerPlayground
