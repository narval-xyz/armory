import { Module } from '@nestjs/common'
import { AppModule } from '../app/app.module'
import { DEFAULT_HTTP_MODULE_PROVIDERS } from '../armory.constant'
import { PolicyEngineModule } from '../policy-engine/policy-engine.module'
import { AdminApiKeyGuard } from '../shared/guard/admin-api-key.guard'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { ClientService } from './core/service/client.service'
import { ClientController } from './http/rest/controller/client.controller'
import { ClientRepository } from './persistence/repository/client.repository'
import { LoggerModule } from '@narval/nestjs-shared'

const INFRASTRUCTURE_MODULES = [PersistenceModule, LoggerModule]

const DOMAIN_MODULES = [AppModule, PolicyEngineModule]

@Module({
  imports: [...INFRASTRUCTURE_MODULES, ...DOMAIN_MODULES],
  controllers: [ClientController],
  providers: [...DEFAULT_HTTP_MODULE_PROVIDERS, ClientService, ClientRepository, AdminApiKeyGuard],
  exports: [ClientService]
})
export class ClientModule {}
