import { HttpModule } from '@nestjs/axios'
import { forwardRef, Module, OnApplicationBootstrap, ValidationPipe } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'
import { AppModule } from '../main.module'
import { AdminApiKeyGuard } from '../shared/guard/admin-api-key.guard'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { BootstrapService } from './core/service/bootstrap.service'
import { ClientService } from './core/service/client.service'
import { ClientController } from './http/rest/controller/client.controller'
import { ClientRepository } from './persistence/repository/client.repository'

@Module({
  imports: [HttpModule, KeyValueModule, PersistenceModule, forwardRef(() => AppModule)],
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
