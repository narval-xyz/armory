import { HttpModule } from '@nestjs/axios'
import { Module, OnApplicationBootstrap, ValidationPipe, forwardRef } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminApiKeyGuard } from '../shared/guard/admin-api-key.guard'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { VaultModule } from '../vault/vault.module'
import { BootstrapService } from './core/service/bootstrap.service'
import { ClientService } from './core/service/client.service'
import { ClientController } from './http/rest/controller/client.controller'
import { ClientRepository } from './persistence/repository/client.repository'

@Module({
  // NOTE: The AdminApiKeyGuard is the only reason we need the VaultModule.
  imports: [HttpModule, KeyValueModule, forwardRef(() => VaultModule)],
  controllers: [ClientController],
  providers: [
    AdminApiKeyGuard,
    BootstrapService,
    ClientRepository,
    ClientService,
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
  exports: [ClientService, ClientRepository]
})
export class ClientModule implements OnApplicationBootstrap {
  constructor(private bootstrapService: BootstrapService) {}

  async onApplicationBootstrap() {
    await this.bootstrapService.boot()
  }
}
