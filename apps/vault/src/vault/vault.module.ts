import { ConfigModule, ConfigService } from '@narval/config-module'
import { EncryptionModule } from '@narval/encryption-module'
import { HttpModule } from '@nestjs/axios'
import { Module, ValidationPipe, forwardRef } from '@nestjs/common'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { ClientModule } from '../client/client.module'
import { load } from '../main.config'
import { EncryptionModuleOptionFactory } from '../shared/factory/encryption-module-option.factory'
import { ApplicationExceptionFilter } from '../shared/filter/application-exception.filter'
import { ZodExceptionFilter } from '../shared/filter/zod-exception.filter'
import { NonceGuard } from '../shared/guard/nonce.guard'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { AppService } from './core/service/app.service'
import { KeyGenerationService } from './core/service/generate.service'
import { ImportService } from './core/service/import.service'
import { NonceService } from './core/service/nonce.service'
import { ProvisionService } from './core/service/provision.service'
import { SigningService } from './core/service/signing.service'
import { GenerateController } from './http/rest/controller/generate.controller'
import { ImportController } from './http/rest/controller/import.controller'
import { ProvisionController } from './http/rest/controller/provision.controller'
import { SignController } from './http/rest/controller/sign.controller'
import { AppRepository } from './persistence/repository/app.repository'
import { ImportRepository } from './persistence/repository/import.repository'
import { WalletRepository } from './persistence/repository/wallet.repository'
import { VaultController } from './vault.controller'
import { VaultService } from './vault.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true
    }),
    HttpModule,
    forwardRef(() => KeyValueModule),
    EncryptionModule.registerAsync({
      imports: [VaultModule],
      inject: [ConfigService, AppService],
      useClass: EncryptionModuleOptionFactory
    }),
    forwardRef(() => ClientModule)
  ],
  controllers: [VaultController, ImportController, SignController, ProvisionController, GenerateController],
  providers: [
    AppRepository,
    AppService,
    ImportRepository,
    ImportService,
    NonceGuard,
    NonceService,
    ProvisionService,
    SigningService,
    KeyGenerationService,
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
