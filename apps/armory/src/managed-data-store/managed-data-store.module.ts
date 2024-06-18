import { ConfigModule } from '@narval/config-module'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { load } from '../armory.config'
import { DEFAULT_HTTP_MODULE_PROVIDERS } from '../armory.constant'
import { ClientModule } from '../client/client.module'
import { PolicyEngineModule } from '../policy-engine/policy-engine.module'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { EntityDataStoreService } from './core/service/entity-data-store.service'
import { PolicyDataStoreService } from './core/service/policy-data-store.service'
import { DataStoreController } from './http/rest/controller/data-store.controller'
import { EntityDataStoreRepository } from './persistence/repository/entity-data-store.repository'
import { PolicyDataStoreRepository } from './persistence/repository/policy-data-store.repository'
import { DataStoreGuard } from './shared/guard/data-store.guard'

const INFRASTRUCTURE_MODULES = [
  ConfigModule.forRoot({
    load: [load]
  }),
  HttpModule,
  PersistenceModule
]

const DOMAIN_MODULES = [ClientModule, PolicyEngineModule]

@Module({
  imports: [...INFRASTRUCTURE_MODULES, ...DOMAIN_MODULES],
  controllers: [DataStoreController],
  providers: [
    ...DEFAULT_HTTP_MODULE_PROVIDERS,
    DataStoreGuard,
    EntityDataStoreService,
    PolicyDataStoreService,
    EntityDataStoreRepository,
    PolicyDataStoreRepository
  ]
})
export class ManagedDataStoreModule {}
