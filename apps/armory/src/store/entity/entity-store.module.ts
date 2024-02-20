import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { load } from '../../orchestration.config'
import { PolicyEngineModule } from '../../policy-engine/policy-engine.module'
import { PersistenceModule } from '../../shared/module/persistence/persistence.module'
import { AddressBookService } from './core/service/address-book.service'
import { CredentialService } from './core/service/credential.service'
import { EntityService } from './core/service/entity.service'
import { OrganizationService } from './core/service/organization.service'
import { TokenService } from './core/service/token.service'
import { UserGroupService } from './core/service/user-group.service'
import { UserService } from './core/service/user.service'
import { WalletService } from './core/service/wallet.service'
import { AddressBookController } from './http/rest/controller/address-book.controller'
import { CredentialController } from './http/rest/controller/credential.controller'
import { EntityController } from './http/rest/controller/entity.controller'
import { OrganizationController } from './http/rest/controller/organization.controller'
import { TokenController } from './http/rest/controller/token.controller'
import { UserGroupController } from './http/rest/controller/user-group.controller'
import { UserWalletController } from './http/rest/controller/user-wallet.controller'
import { UserController } from './http/rest/controller/user.controller'
import { WalletGroupController } from './http/rest/controller/wallet-group.controller'
import { WalletController } from './http/rest/controller/wallet.controller'
import { EntityStoreSeed } from './persistence/entity-store.seed'
import { AddressBookRepository } from './persistence/repository/address-book.repository'
import { CredentialRepository } from './persistence/repository/credential.repository'
import { OrganizationRepository } from './persistence/repository/organization.repository'
import { TokenRepository } from './persistence/repository/token.repository'
import { UserGroupRepository } from './persistence/repository/user-group.repository'
import { UserWalletRepository } from './persistence/repository/user-wallet.repository'
import { UserRepository } from './persistence/repository/user.repository'
import { WalletGroupRepository } from './persistence/repository/wallet-group.repository'
import { WalletRepository } from './persistence/repository/wallet.repository'

@Module({
  imports: [ConfigModule.forRoot({ load: [load] }), PersistenceModule, PolicyEngineModule],
  controllers: [
    AddressBookController,
    CredentialController,
    EntityController,
    OrganizationController,
    TokenController,
    UserController,
    UserGroupController,
    UserWalletController,
    WalletController,
    WalletGroupController
  ],
  providers: [
    AddressBookRepository,
    AddressBookService,
    CredentialRepository,
    CredentialService,
    EntityService,
    EntityStoreSeed,
    OrganizationRepository,
    OrganizationService,
    TokenRepository,
    TokenService,
    UserGroupRepository,
    UserGroupService,
    UserRepository,
    UserService,
    UserWalletRepository,
    WalletGroupRepository,
    WalletRepository,
    WalletService,
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
