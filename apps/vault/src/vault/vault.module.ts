import { ConfigService } from '@narval/config-module'
import { EncryptionModule } from '@narval/encryption-module'
import { HttpModule } from '@nestjs/axios'
import { Module, ValidationPipe, forwardRef } from '@nestjs/common'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { ClientModule } from '../client/client.module'
import { EncryptionModuleOptionFactory } from '../shared/factory/encryption-module-option.factory'
import { ApplicationExceptionFilter } from '../shared/filter/application-exception.filter'
import { ZodExceptionFilter } from '../shared/filter/zod-exception.filter'
import { NonceGuard } from '../shared/guard/nonce.guard'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { AppService } from './core/service/app.service'
import { BackupService } from './core/service/backup.service'
import { ImportService } from './core/service/import.service'
import { NonceService } from './core/service/nonce.service'
import { ProvisionService } from './core/service/provision.service'
import { SeedService } from './core/service/seed.service'
import { SigningService } from './core/service/signing.service'
import { WalletService } from './core/service/wallet.service'
import { ImportController } from './http/rest/controller/import.controller'
import { ProvisionController } from './http/rest/controller/provision.controller'
import { SeedController } from './http/rest/controller/seed.controller'
import { WalletController } from './http/rest/controller/wallet.controller'
import { AppRepository } from './persistence/repository/app.repository'
import { BackupRepository } from './persistence/repository/backup.repository'
import { ImportRepository } from './persistence/repository/import.repository'
import { SeedRepository } from './persistence/repository/mnemonic.repository'
import { WalletRepository } from './persistence/repository/wallet.repository'
import { VaultController } from './vault.controller'
import { VaultService } from './vault.service'

@Module({
  imports: [
    HttpModule,
    PersistenceModule,
    forwardRef(() => KeyValueModule),
    EncryptionModule.registerAsync({
      imports: [VaultModule],
      inject: [ConfigService, AppService],
      useClass: EncryptionModuleOptionFactory
    }),
    forwardRef(() => ClientModule)
  ],
  controllers: [VaultController, ImportController, ProvisionController, SeedController, WalletController],
  providers: [
    AppRepository,
    AppService,
    ImportRepository,
    ImportService,
    NonceGuard,
    NonceService,
    ProvisionService,
    SigningService,
    SeedService,
    WalletService,
    BackupService,
    SeedRepository,
    BackupRepository,
    VaultService,
    WalletRepository,
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
export class VaultModule {}
