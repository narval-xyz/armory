'use client'

import Playground from '../../_components/Playground'
import useArmoryApi from '../../_hooks/useArmoryApi'

const AuthServerPlayground = () => {
  const { errors, authorizationResponse, authorize } = useArmoryApi()

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
