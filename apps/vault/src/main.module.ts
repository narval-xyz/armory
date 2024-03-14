import { EncryptionModule } from '@narval/encryption-module'
import { Module, ValidationPipe, forwardRef } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { load } from './main.config'
import { EncryptionModuleOptionFactory } from './shared/factory/encryption-module-option.factory'
import { TenantModule } from './tenant/tenant.module'
import { AppService } from './vault/core/service/app.service'
import { VaultModule } from './vault/vault.module'

@Module({
  imports: [
    // Infrastructure
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true
    }),
    EncryptionModule.registerAsync({
      imports: [forwardRef(() => VaultModule)],
      inject: [ConfigService, AppService],
      useClass: EncryptionModuleOptionFactory
    }),

    // Domain
    VaultModule,
    TenantModule
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class MainModule {}
