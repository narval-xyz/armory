import { HttpModule } from '@nestjs/axios'
import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'
import { OrchestrationModule } from '../orchestration/orchestration.module'
import { ApplicationExceptionFilter } from '../shared/filter/application-exception.filter'
import { ZodExceptionFilter } from '../shared/filter/zod-exception.filter'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { EntityDataStoreService } from './core/service/entity-data-store.service'
import { FakeVaultService } from './core/service/fake-vault.service'
import { PolicyDataStoreService } from './core/service/policy-data-store.service'
import { DataStoreController } from './http/controller/data-store.controller'
import { EntityDataStoreRepository } from './persistence/repository/entity-data-store.repository'
import { PolicyDataStoreRepository } from './persistence/repository/policy-data-store.repository'

@Module({
  imports: [ConfigModule.forRoot(), HttpModule, PersistenceModule, OrchestrationModule],
  controllers: [DataStoreController],
  providers: [
    FakeVaultService,
    EntityDataStoreService,
    PolicyDataStoreService,
    EntityDataStoreRepository,
    PolicyDataStoreRepository,
    {
      provide: APP_FILTER,
      useClass: ApplicationExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: ZodExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    }
  ],
  exports: []
})
export class AdminModule {}
