import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PersistenceModule } from '../persistence/persistence.module'
import { FacadeController } from './controller/facade.controller'

@Module({
  imports: [ConfigModule.forRoot(), PersistenceModule],
  controllers: [FacadeController]
})
export class PolicyEngineModule {}
