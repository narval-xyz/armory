import { ConfigModule } from '@narval/config-module'
import { HttpModule } from '@nestjs/axios'
import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'
import { load } from '../armory.config'
import { OrchestrationModule } from '../orchestration/orchestration.module'
import { ApplicationExceptionFilter } from '../shared/filter/application-exception.filter'
import { ZodExceptionFilter } from '../shared/filter/zod-exception.filter'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { EntityDataStoreService } from './core/service/entity-data-store.service'
import { PolicyDataStoreService } from './core/service/policy-data-store.service'
import { DataStoreController } from './http/rest/controller/data-store.controller'
import { ClientRepository } from './persistence/repository/client.repository'
import { EntityDataStoreRepository } from './persistence/repository/entity-data-store.repository'
import { PolicyDataStoreRepository } from './persistence/repository/policy-data-store.repository'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load]
    }),
    HttpModule,
    PersistenceModule,
    OrchestrationModule
  ],
  controllers: [DataStoreController],
  providers: [
    EntityDataStoreService,
    PolicyDataStoreService,
    EntityDataStoreRepository,
    PolicyDataStoreRepository,
    ClientRepository,
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
export class ManagedDataStoreModule {}
