import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { load } from '../../orchestration.config'
import { PolicyEngineModule } from '../../policy-engine/policy-engine.module'
import { PersistenceModule } from '../../shared/module/persistence/persistence.module'
import { OrganizationService } from './core/service/organization.service'
import { UserGroupService } from './core/service/user-group.service'
import { UserService } from './core/service/user.service'
import { WalletService } from './core/service/wallet.service'
import { OrganizationController } from './http/rest/controller/organization.controller'
import { UserGroupController } from './http/rest/controller/user-group.controller'
import { UserController } from './http/rest/controller/user.controller'
import { WalletGroupController } from './http/rest/controller/wallet-group.controller'
import { WalletController } from './http/rest/controller/wallet.controller'
import { AuthCredentialRepository } from './persistence/repository/auth-credential.repository'
import { OrganizationRepository } from './persistence/repository/organization.repository'
import { UserGroupRepository } from './persistence/repository/user-group.repository'
import { UserRepository } from './persistence/repository/user.repository'
import { WalletGroupRepository } from './persistence/repository/wallet-group.repository'
import { WalletRepository } from './persistence/repository/wallet.repository'

@Module({
  imports: [ConfigModule.forRoot({ load: [load] }), PersistenceModule, PolicyEngineModule],
  controllers: [OrganizationController, UserController, UserGroupController, WalletController, WalletGroupController],
  providers: [
    OrganizationService,
    OrganizationRepository,
    UserService,
    UserRepository,
    UserGroupService,
    UserGroupRepository,
    AuthCredentialRepository,
    WalletService,
    WalletRepository,
    WalletGroupRepository,
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
