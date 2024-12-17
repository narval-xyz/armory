import { TrackClientIdMiddleware } from '@narval/nestjs-shared'
import { HttpModule } from '@nestjs/axios'
import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { AppRepository } from '../app.repository'
import { ClientModule } from '../client/client.module'
import { ApplicationExceptionFilter } from '../shared/filter/application-exception.filter'
import { ZodExceptionFilter } from '../shared/filter/zod-exception.filter'
import { NonceGuard } from '../shared/guard/nonce.guard'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { AdminService } from './core/service/admin.service'
import { ImportService } from './core/service/import.service'
import { KeyGenerationService } from './core/service/key-generation.service'
import { NonceService } from './core/service/nonce.service'
import { SigningService } from './core/service/signing.service'
import { AccountController } from './http/rest/controller/account.controller'
import { EncryptionKeyController } from './http/rest/controller/encryption-key.controller'
import { SignController } from './http/rest/controller/sign.controller'
import { WalletController } from './http/rest/controller/wallet.controller'
import { AccountRepository } from './persistence/repository/account.repository'
import { BackupRepository } from './persistence/repository/backup.repository'
import { ImportRepository } from './persistence/repository/import.repository'
import { RootKeyRepository } from './persistence/repository/root-key.repository'
import { VaultController } from './vault.controller'

@Module({
  imports: [HttpModule, PersistenceModule, KeyValueModule, ClientModule],
  controllers: [VaultController, WalletController, SignController, AccountController, EncryptionKeyController],
  providers: [
    AppRepository,
    AdminService,
    ImportRepository,
    ImportService,
    NonceGuard,
    NonceService,
    SigningService,
    KeyGenerationService,
    RootKeyRepository,
    BackupRepository,
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
  exports: []
})
export class VaultModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TrackClientIdMiddleware).forRoutes('*')
  }
}
