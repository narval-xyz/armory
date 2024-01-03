import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PersistenceModule } from '../persistence/persistence.module'
import { FacadeController } from './http/rest/controller/facade.controller'

@Module({
  imports: [ConfigModule.forRoot(), PersistenceModule],
  controllers: [FacadeController]
})
export class PolicyEngineModule {}
