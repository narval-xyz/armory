import { Module } from '@nestjs/common'
import { DEFAULT_HTTP_MODULE_PROVIDERS } from '../shared/constant'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { ConnectionService } from './core/service/connection.service'
import { ConnectionController } from './http/rest/controller/connection.controller'
import { ConnectionRepository } from './persistence/repository/connection.repository'

@Module({
  imports: [PersistenceModule],
  controllers: [ConnectionController],
  providers: [...DEFAULT_HTTP_MODULE_PROVIDERS, ConnectionService, ConnectionRepository]
})
export class BrokerModule {}
