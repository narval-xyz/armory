import EngineConfig from './_components/engine/EngineConfig'
import VaultConfig from './_components/vault/VaultConfig'

export default async function PolicyEngine() {
  return (
    <div className="grid grid-cols-2 gap-[64px] h-full">
      <EngineConfig />
      <VaultConfig />
    </div>
  )
}
