'use client'

import { SendEvaluationResponse, SignatureRequest } from '@narval/armory-sdk'
import { useEffect, useState } from 'react'
import Playground from '../../_components/Playground'
import useEngineApi from '../../_hooks/useEngineApi'
import useVaultApi from '../../_hooks/useVaultApi'

const PolicyEnginePlayground = () => {
  const { errors: evaluationErrors, evaluate } = useEngineApi()
  const { errors: signatureErrors, sign, importPk } = useVaultApi()

  const [errors, setErrors] = useState<string>()

  useEffect(() => {
    if (evaluationErrors) {
      setErrors(evaluationErrors)
    } else if (signatureErrors) {
      setErrors(signatureErrors)
    }
  }, [evaluationErrors, signatureErrors])

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
      errors={errors}
      evaluate={evaluate}
      sign={sign}
      importPk={importPk}
      validateResponse={validateResponse}
    />
  )
}

export default PolicyEnginePlayground
