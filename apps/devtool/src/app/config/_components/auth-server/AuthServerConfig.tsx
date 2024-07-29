'use client'

import NarInput from '../../../_design-system/NarInput'
import NarUrlInput from '../../../_design-system/NarUrlInput'
import useStore from '../../../_hooks/useStore'
import AddAuthClientModal from './AddAuthClientModal'

const AuthServerConfig = () => {
  const { authUrl: authServerUrl, authAdminApiKey, setAuthUrl: setAuthServerUrl, setAuthAdminApiKey } = useStore()

  return (
    <div className="flex flex-col gap-[48px]">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Authorization Server</div>
        <AddAuthClientModal />
      </div>
      <div className="flex flex-col gap-6">
        <NarUrlInput label="Auth URL" value={authServerUrl} onValueChange={setAuthServerUrl} />
        <NarInput label="Admin API Key" value={authAdminApiKey} onChange={setAuthAdminApiKey} type="password" />
      </div>
    </div>
  )
}

export default AuthServerConfig
