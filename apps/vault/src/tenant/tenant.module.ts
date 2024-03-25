import { HttpModule } from '@nestjs/axios'
import { Module, OnApplicationBootstrap, ValidationPipe, forwardRef } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import { AdminApiKeyGuard } from '../shared/guard/admin-api-key.guard'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { VaultModule } from '../vault/vault.module'
import { BootstrapService } from './core/service/bootstrap.service'
import { TenantService } from './core/service/tenant.service'
import { TenantController } from './http/rest/controller/tenant.controller'
import { TenantRepository } from './persistence/repository/tenant.repository'

@Module({
  // NOTE: The AdminApiKeyGuard is the only reason we need the VaultModule.
  imports: [HttpModule, KeyValueModule, forwardRef(() => VaultModule)],
  controllers: [TenantController],
  providers: [
    AdminApiKeyGuard,
    BootstrapService,
    TenantRepository,
    TenantService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ],
  exports: [TenantService, TenantRepository]
})
export class TenantModule implements OnApplicationBootstrap {
  constructor(private bootstrapService: BootstrapService) {}

  async onApplicationBootstrap() {
    await this.bootstrapService.boot()
  }
}
