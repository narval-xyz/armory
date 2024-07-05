import { ConfigService } from '@narval/config-module'
import { EncryptionModule } from '@narval/encryption-module'
import { HttpModule, LoggerService } from '@narval/nestjs-shared'
import { Module, ValidationPipe } from '@nestjs/common'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod'
import { EncryptionModuleOptionFactory } from '../shared/factory/encryption-module-option.factory'
import { AdminApiKeyGuard } from '../shared/guard/admin-api-key.guard'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { AppController } from './app.controller'
import { DataStoreRepositoryFactory } from './core/factory/data-store-repository.factory'
import { signingServiceFactory } from './core/factory/signing-service.factory'
import { BootstrapService } from './core/service/bootstrap.service'
import { ClientService } from './core/service/client.service'
import { DataStoreService } from './core/service/data-store.service'
import { EngineService } from './core/service/engine.service'
import { EvaluationService } from './core/service/evaluation.service'
import { ProvisionService } from './core/service/provision.service'
import { ClientController } from './http/rest/controller/client.controller'
import { EvaluationController } from './http/rest/controller/evaluation.controller'
import { ProvisionController } from './http/rest/controller/provision.controller'
import { ClientRepository } from './persistence/repository/client.repository'
import { EngineRepository } from './persistence/repository/engine.repository'
import { FileSystemDataStoreRepository } from './persistence/repository/file-system-data-store.repository'
import { HttpDataStoreRepository } from './persistence/repository/http-data-store.repository'

@Module({
  imports: [
    HttpModule.forRoot(),
    KeyValueModule,
    EncryptionModule.registerAsync({
      imports: [EngineModule],
      inject: [ConfigService, EngineService, LoggerService],
      useClass: EncryptionModuleOptionFactory
    })
  ],
  controllers: [ProvisionController, AppController, ClientController, EvaluationController],
  providers: [
    AdminApiKeyGuard,
    BootstrapService,
    DataStoreRepositoryFactory,
    DataStoreService,
    EngineRepository,
    EngineService,
    EvaluationService,
    FileSystemDataStoreRepository,
    HttpDataStoreRepository,
    ProvisionService,
    ClientRepository,
    ClientService,
    {
      provide: 'SigningService',
      useFactory: signingServiceFactory,
      inject: [ConfigService]
    },
    {
      // DEPRECATE: Use Zod generated DTOs to validate request and responses.
      provide: APP_PIPE,
      useClass: ValidationPipe
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor
    }
  ],
  exports: [EngineService, ProvisionService, BootstrapService]
})
export class EngineModule {}
