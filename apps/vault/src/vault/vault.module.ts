import { ConfigService } from '@narval/config-module'
import { EncryptionModule } from '@narval/encryption-module'
import { LoggerService, OpenTelemetryModule, TrackClientIdMiddleware } from '@narval/nestjs-shared'
import { HttpModule } from '@nestjs/axios'
import { MiddlewareConsumer, Module, ValidationPipe, forwardRef } from '@nestjs/common'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { ClientModule } from '../client/client.module'
import { EncryptionModuleOptionFactory } from '../shared/factory/encryption-module-option.factory'
import { ApplicationExceptionFilter } from '../shared/filter/application-exception.filter'
import { ZodExceptionFilter } from '../shared/filter/zod-exception.filter'
import { NonceGuard } from '../shared/guard/nonce.guard'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { AdminService } from './core/service/admin.service'
import { AppService } from './core/service/app.service'
import { ImportService } from './core/service/import.service'
import { KeyGenerationService } from './core/service/key-generation.service'
import { NonceService } from './core/service/nonce.service'
import { ProvisionService } from './core/service/provision.service'
import { SigningService } from './core/service/signing.service'
import { AccountController } from './http/rest/controller/account.controller'
import { EncryptionKeyController } from './http/rest/controller/encryption-key.controller'
import { ProvisionController } from './http/rest/controller/provision.controller'
import { SignController } from './http/rest/controller/sign.controller'
import { WalletController } from './http/rest/controller/wallet.controller'
import { AccountRepository } from './persistence/repository/account.repository'
import { AppRepository } from './persistence/repository/app.repository'
import { BackupRepository } from './persistence/repository/backup.repository'
import { ImportRepository } from './persistence/repository/import.repository'
import { RootKeyRepository } from './persistence/repository/root-key.repository'
import { VaultController } from './vault.controller'
import { VaultService } from './vault.service'

@Module({
  imports: [
    HttpModule,
    PersistenceModule,
    forwardRef(() => KeyValueModule),
    EncryptionModule.registerAsync({
      imports: [VaultModule],
      inject: [ConfigService, AppService, LoggerService],
      useClass: EncryptionModuleOptionFactory
    }),
    forwardRef(() => ClientModule),
    OpenTelemetryModule.forRoot()
  ],
  controllers: [
    VaultController,
    WalletController,
    SignController,
    ProvisionController,
    AccountController,
    EncryptionKeyController
  ],
  providers: [
    AppRepository,
    AppService,
    AdminService,
    ImportRepository,
    ImportService,
    NonceGuard,
    NonceService,
    ProvisionService,
    SigningService,
    KeyGenerationService,
    RootKeyRepository,
    BackupRepository,
    VaultService,
    AccountRepository,
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe({ transform: true })
    },
    {
      provide: APP_FILTER,
      useClass: ApplicationExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: ZodExceptionFilter
    }
  ],
  exports: [AppService, ProvisionService]
})
export class VaultModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TrackClientIdMiddleware).forRoutes('*')
  }
}
