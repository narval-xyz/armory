import { HttpModule } from '@nestjs/axios'
import { Module, OnApplicationBootstrap, ValidationPipe } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import { EngineModule } from '../engine/engine.module'
import { AdminApiKeyGuard } from '../shared/guard/admin-api-key.guard'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { DataStoreRepositoryFactory } from './core/factory/data-store-repository.factory'
import { BootstrapService } from './core/service/bootstrap.service'
import { DataStoreService } from './core/service/data-store.service'
import { TenantService } from './core/service/tenant.service'
import { TenantController } from './http/rest/controller/tenant.controller'
import { FileSystemDataStoreRepository } from './persistence/repository/file-system-data-store.repository'
import { HttpDataStoreRepository } from './persistence/repository/http-data-store.repository'
import { TenantRepository } from './persistence/repository/tenant.repository'

@Module({
  // NOTE: The AdminApiKeyGuard is the only reason we need the EngineModule.
  imports: [HttpModule, KeyValueModule, EngineModule],
  controllers: [TenantController],
  providers: [
    AdminApiKeyGuard,
    BootstrapService,
    DataStoreRepositoryFactory,
    DataStoreService,
    FileSystemDataStoreRepository,
    HttpDataStoreRepository,
    TenantRepository,
    TenantService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class TenantModule implements OnApplicationBootstrap {
  constructor(private bootstrapService: BootstrapService) {}

  async onApplicationBootstrap() {
    await this.bootstrapService.boot()
  }
}
