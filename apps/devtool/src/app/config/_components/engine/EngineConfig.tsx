'use client'

import NarInput from '../../../_design-system/NarInput'
import useStore from '../../../_hooks/useStore'
import AddEngineClientModal from './AddEngineClientModal'

const EngineConfig = () => {
  const { engineUrl, engineAdminApiKey, setEngineUrl, setEngineAdminApiKey } = useStore()

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center">
        <div className="text-nv-2xl grow">Policy Engine</div>
        <AddEngineClientModal />
      </div>
      <div className="flex flex-col gap-6">
        <NarInput label="Engine URL" value={engineUrl} onChange={setEngineUrl} />
        <NarInput label="Admin API Key" value={engineAdminApiKey} onChange={setEngineAdminApiKey} />
      </div>
    </div>
  )
}

export default EngineConfig
