import { Module } from '@nestjs/common'
import { AppModule } from '../app/app.module'
import { ProvisionCommand } from './command/provision.command'

@Module({
  imports: [AppModule],
  providers: [ProvisionCommand]
})
export class CliModule {}
