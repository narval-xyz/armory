import { EncryptionModule } from '@narval/encryption-module'
import { HttpModule } from '@nestjs/axios'
import { Module, ValidationPipe, forwardRef } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { load } from '../main.config'
import { EncryptionModuleOptionFactory } from '../shared/factory/encryption-module-option.factory'
import { ApplicationExceptionFilter } from '../shared/filter/application-exception.filter'
import { ZodExceptionFilter } from '../shared/filter/zod-exception.filter'
import { ClientSecretGuard } from '../shared/guard/client-secret.guard'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { TenantModule } from '../tenant/tenant.module'
import { AppService } from './core/service/app.service'
import { ImportService } from './core/service/import.service'
import { ProvisionService } from './core/service/provision.service'
import { SigningService } from './core/service/signing.service'
import { ImportController } from './http/rest/controller/import.controller'
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
    forwardRef(() => TenantModule)
  ],
  controllers: [VaultController, ImportController, SignController],
  providers: [
    AppService,
    AppRepository,
    ClientSecretGuard,
    ImportService,
    VaultService,
    ProvisionService,
    SigningService,
    WalletRepository,
    ImportRepository,
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          transform: true
        })
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
