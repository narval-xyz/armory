import EngineConfig from './_components/engine/EngineConfig'
import VaultConfig from './_components/vault/VaultConfig'

export default async function PolicyEngine() {
  return (
    <div className="flex flex-col gap-[24px]">
      <EngineConfig />
      <VaultConfig />
    </div>
  )
}
