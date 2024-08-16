'use client'

import NarInput from '../../../_design-system/NarInput'
import NarUrlInput from '../../../_design-system/NarUrlInput'
import useStore from '../../../_hooks/useStore'
import AddEngineClientModal from './AddEngineClientModal'

const EngineConfig = () => {
  const { engineUrl, engineAdminApiKey, setEngineUrl, setEngineAdminApiKey } = useStore()

  return (
    <div className="flex flex-col gap-[48px]">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Policy Engine (if not using Auth)</div>
        <AddEngineClientModal />
      </div>
      <div className="flex flex-col gap-6">
        <NarUrlInput label="Engine URL" value={engineUrl} onValueChange={setEngineUrl} />
        <NarInput label="Admin API Key" value={engineAdminApiKey} onChange={setEngineAdminApiKey} type="password" />
      </div>
    </div>
  )
}

export default EngineConfig
