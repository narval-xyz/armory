import { Module } from '@nestjs/common'
import { VaultModule } from '../vault/vault.module'
import { ProvisionCommand } from './command/provision.command'

@Module({
  imports: [VaultModule],
  providers: [ProvisionCommand]
})
export class CliModule {}
