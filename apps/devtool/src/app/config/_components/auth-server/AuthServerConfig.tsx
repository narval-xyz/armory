'use client'

import NarInput from '../../../_design-system/NarInput'
import useStore from '../../../_hooks/useStore'
import AddAuthClientModal from './AddAuthClientModal'

const AuthServerConfig = () => {
  const { authServerUrl, setAuthServerUrl } = useStore()

  return (
    <div className="flex flex-col gap-[48px]">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Authorization Server</div>
        <AddAuthClientModal />
      </div>
      <div className="flex flex-col gap-6">
        <NarInput label="Auth Server URL" value={authServerUrl} onChange={setAuthServerUrl} />
      </div>
    </div>
  )
}

export default AuthServerConfig
