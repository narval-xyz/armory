import { Module } from '@nestjs/common'
import { VALIDATION_PIPES } from '../armory.constant'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { ClientService } from './core/service/client.service'
import { ClientController } from './http/rest/controller/client.controller'
import { ClientRepository } from './persistence/repository/client.repository'

@Module({
  imports: [PersistenceModule],
  controllers: [ClientController],
  providers: [ClientService, ClientRepository, ...VALIDATION_PIPES]
})
export class ClientModule {}
