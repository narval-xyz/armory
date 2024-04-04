import { EncryptionModule } from '@narval/encryption-module'
import { Module, ValidationPipe, forwardRef } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'
import { ClientModule } from './client/client.module'
import { load } from './main.config'
import { EncryptionModuleOptionFactory } from './shared/factory/encryption-module-option.factory'
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
    ClientModule
  ],
  providers: [
    {
      // DEPRECATE: Use Zod generated DTOs to validate request and responses.
      provide: APP_PIPE,
      useClass: ValidationPipe
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    }
  ]
})
export class MainModule {}
