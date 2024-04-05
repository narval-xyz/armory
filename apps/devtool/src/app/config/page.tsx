import PolicyEngineConfig from './_components/PolicyEngineConfig'
import VaultConfig from './_components/VaultConfig'

export default async function PolicyEngine() {
  return (
    <div className="flex flex-col gap-20">
      <PolicyEngineConfig />
      <VaultConfig />
    </div>
  )
}
