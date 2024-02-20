import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { EntityRepository } from './core/repository/entity.repository'
import { EntityService } from './core/service/entity.service'
import { StorageController } from './http/rest/controller/storage.controller'
import { InMemoryEntityRepository } from './persistence/repository/in-memory-entity.repository'

@Module({
  controllers: [StorageController],
  providers: [
    EntityService,
    {
      provide: EntityRepository,
      useClass: InMemoryEntityRepository
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class StorageModule {}
