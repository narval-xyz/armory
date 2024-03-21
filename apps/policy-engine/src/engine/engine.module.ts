import { EncryptionModule } from '@narval/encryption-module'
import { HttpModule } from '@nestjs/axios'
import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { load } from '../policy-engine.config'
import { EncryptionModuleOptionFactory } from '../shared/factory/encryption-module-option.factory'
import { AdminApiKeyGuard } from '../shared/guard/admin-api-key.guard'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { AppController } from './app.controller'
import { DataStoreRepositoryFactory } from './core/factory/data-store-repository.factory'
import { BootstrapService } from './core/service/bootstrap.service'
import { DataStoreService } from './core/service/data-store.service'
import { EngineService } from './core/service/engine.service'
import { EvaluationService } from './core/service/evaluation.service'
import { ProvisionService } from './core/service/provision.service'
import { SigningService } from './core/service/signing.service'
import { TenantService } from './core/service/tenant.service'
import { TenantController } from './http/rest/controller/tenant.controller'
import { EngineRepository } from './persistence/repository/engine.repository'
import { FileSystemDataStoreRepository } from './persistence/repository/file-system-data-store.repository'
import { HttpDataStoreRepository } from './persistence/repository/http-data-store.repository'
import { TenantRepository } from './persistence/repository/tenant.repository'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true
    }),
    HttpModule,
    KeyValueModule,
    EncryptionModule.registerAsync({
      imports: [EngineModule],
      inject: [ConfigService, EngineService],
      useClass: EncryptionModuleOptionFactory
    })
  ],
  controllers: [AppController, TenantController],
  providers: [
    AdminApiKeyGuard,
    EngineRepository,
    EngineService,
    ProvisionService,
    SigningService,
    BootstrapService,
    DataStoreRepositoryFactory,
    DataStoreService,
    FileSystemDataStoreRepository,
    HttpDataStoreRepository,
    TenantRepository,
    TenantService,
    EvaluationService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ],
  exports: [EngineService, ProvisionService, BootstrapService]
})
export class EngineModule {}
