import { Module } from '@nestjs/common'
import { EngineModule } from '../engine/engine.module'
import { ProvisionCommand } from './command/provision.command'

@Module({
  imports: [EngineModule],
  providers: [ProvisionCommand]
})
export class CliModule {}
