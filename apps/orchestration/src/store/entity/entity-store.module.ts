import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { load } from '../../orchestration.config'
import { PolicyEngineModule } from '../../policy-engine/policy-engine.module'
import { PersistenceModule } from '../../shared/module/persistence/persistence.module'
import { OrganizationEntityService } from './core/service/organization-entity.service'
import { UserEntityService } from './core/service/user-entity.service'
import { UserGroupEntityService } from './core/service/user-group-entity.service'
import { OrganizationController } from './http/rest/controller/organization.controller'
import { UserEntityController } from './http/rest/controller/user-entity.controller'
import { UserGroupEntityController } from './http/rest/controller/user-group-entity.controller'
import { AuthCredentialRepository } from './persistence/repository/auth-credential.repository'
import { OrganizationRepository } from './persistence/repository/organization.repository'
import { UserGroupRepository } from './persistence/repository/user-group.repository'
import { UserRepository } from './persistence/repository/user.repository'

@Module({
  imports: [ConfigModule.forRoot({ load: [load] }), PersistenceModule, PolicyEngineModule],
  controllers: [OrganizationController, UserEntityController, UserGroupEntityController],
  providers: [
    OrganizationEntityService,
    OrganizationRepository,
    UserEntityService,
    UserRepository,
    UserGroupEntityService,
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
export class EntityStoreModule {}
