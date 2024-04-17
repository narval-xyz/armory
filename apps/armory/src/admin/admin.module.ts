import { HttpModule } from '@nestjs/axios'
import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'
import { ApplicationExceptionFilter } from '../shared/filter/application-exception.filter'
import { ZodExceptionFilter } from '../shared/filter/zod-exception.filter'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { AdminController } from './admin.controller'
import { DataStoreService } from './core/service/data-store.service'
import { DataStoreController } from './http/controller/data-store.controller'
import { DataStoreRepository } from './persistence/repository/data-store.repository'

@Module({
  imports: [ConfigModule.forRoot(), HttpModule, PersistenceModule],
  controllers: [AdminController, DataStoreController],
  providers: [
    DataStoreService,
    DataStoreRepository,
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
      // DEPRECATE: Use Zod generated DTOs to validate request and responses.
      provide: APP_PIPE,
      useClass: ValidationPipe
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    }
  ],
  exports: []
})
export class AdminModule {}
