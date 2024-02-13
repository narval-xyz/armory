import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { load } from '../orchestration.config'
import { PolicyEngineModule } from '../policy-engine/policy-engine.module'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { UserEntityService } from './entity/core/service/user-entity.service'
import { UserEntityController } from './entity/http/rest/controller/user-entity.controller'
import { AuthCredentialRepository } from './entity/persistence/repository/auth-credential.repository'
import { UserGroupRepository } from './entity/persistence/repository/user-group.repository'
import { UserRepository } from './entity/persistence/repository/user.repository'

// TODO: Move to EntityModule
@Module({
  imports: [ConfigModule.forRoot({ load: [load] }), PersistenceModule, PolicyEngineModule],
  controllers: [UserEntityController],
  providers: [
    UserEntityService,
    UserRepository,
    UserGroupRepository,
    AuthCredentialRepository,

    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class StoreModule {}
