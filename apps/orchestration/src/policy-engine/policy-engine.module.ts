import { PersistenceModule } from '@app/orchestration/persistence/persistence.module'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { FacadeController } from './http/rest/controller/facade.controller'

@Module({
  imports: [ConfigModule.forRoot(), PersistenceModule, HttpModule],
  controllers: [FacadeController]
})
export class PolicyEngineModule {}
