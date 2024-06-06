'use client'

import { SendEvaluationResponse, SignatureRequest } from '@narval/armory-sdk'
import Playground from '../../_components/Playground'
import EngineConfigModal from '../../_components/modals/EngineConfigModal'
import useEngineApi from '../../_hooks/useEngineApi'

const PolicyEnginePlayground = () => {
  const { errors: engineErrors, evaluate } = useEngineApi()

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
      errors={engineErrors}
      evaluate={evaluate}
      validateResponse={validateResponse}
    />
  )
}

export default PolicyEnginePlayground
