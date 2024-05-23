'use client'

import Playground from '../../_components/Playground'
import useAuthServerApi from '../../_hooks/useAuthServerApi'

const AuthServerPlayground = () => {
  const { errors, authorizationResponse, authorize } = useAuthServerApi()

  return (
    <Playground
      title="Authorization Server"
      errors={errors}
      response={authorizationResponse ? JSON.stringify(authorizationResponse, null, 2) : undefined}
      authorize={authorize}
    />
  )
}

export default AuthServerPlayground
