import { Module } from '@nestjs/common'
import { AppModule } from '../engine/app.module'
import { ProvisionCommand } from './command/provision.command'

@Module({
  imports: [AppModule],
  providers: [ProvisionCommand]
})
export class CliModule {}
