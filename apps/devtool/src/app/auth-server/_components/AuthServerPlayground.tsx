'use client'

import { AuthorizationRequest, SignatureRequest } from '@narval/armory-sdk'
import Playground from '../../_components/Playground'
import AuthConfigModal from '../../_components/modals/AuthConfigModal'
import useAuthServerApi from '../../_hooks/useAuthServerApi'

const AuthServerPlayground = () => {
  const { errors: authErrors, authorizationResponse, authorize } = useAuthServerApi()

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
      errors={authErrors}
      response={authorizationResponse ? JSON.stringify(authorizationResponse, null, 2) : undefined}
      authorize={authorize}
      validateResponse={validateResponse}
    />
  )
}

export default AuthServerPlayground
