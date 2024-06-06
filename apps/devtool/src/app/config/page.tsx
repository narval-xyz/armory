import AuthServerConfig from './_components/auth-server/AuthServerConfig'
import EngineConfig from './_components/engine/EngineConfig'
import VaultConfig from './_components/vault/VaultConfig'

export default async function Page() {
  return (
    <div className="grid grid-cols-2 gap-[64px] h-full">
      <AuthServerConfig />
      <VaultConfig />
      <EngineConfig />
    </div>
  )
}
