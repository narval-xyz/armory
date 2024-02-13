import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { load } from '../orchestration.config'
import { PolicyEngineModule } from '../policy-engine/policy-engine.module'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { UserEntityService } from './entity/core/service/user-entity.service'
import { UserEntityController } from './entity/http/rest/user-entity.controller'
import { UserGroupRepository } from './entity/persistence/repository/user-group.repository'
import { UserRepository } from './entity/persistence/repository/user.repository'

@Module({
  imports: [ConfigModule.forRoot({ load: [load] }), PersistenceModule, PolicyEngineModule],
  providers: [UserEntityService, UserRepository, UserGroupRepository],
  controllers: [UserEntityController]
})
export class StoreModule {}
