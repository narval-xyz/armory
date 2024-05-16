import { Module } from '@nestjs/common'
import { VALIDATION_PIPES } from '../armory.constant'
import { PolicyEngineModule } from '../policy-engine/policy-engine.module'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { ClientService } from './core/service/client.service'
import { ClientController } from './http/rest/controller/client.controller'
import { ClientRepository } from './persistence/repository/client.repository'

const INFRASTRUCTURE_MODULES = [PersistenceModule]

const DOMAIN_MODULES = [PolicyEngineModule]

@Module({
  imports: [...INFRASTRUCTURE_MODULES, ...DOMAIN_MODULES],
  controllers: [ClientController],
  providers: [ClientService, ClientRepository, ...VALIDATION_PIPES]
})
export class ClientModule {}
