'use client'

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

  return (
    <Playground title="Policy Engine Playground" errors={errors} evaluate={evaluate} sign={sign} importPk={importPk} />
  )
}

export default PolicyEnginePlayground
