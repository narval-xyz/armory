import { ConfigModule, ConfigService } from '@narval/config-module'
import { EncryptionModule } from '@narval/encryption-module'
import { HttpLoggerMiddleware, LoggerModule, OpenTelemetryModule } from '@narval/nestjs-shared'
import { MiddlewareConsumer, Module, NestModule, OnModuleInit, ValidationPipe, forwardRef } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'
import { ClientModule } from './client/client.module'
import { load } from './main.config'
import { EncryptionModuleOptionFactory } from './shared/factory/encryption-module-option.factory'
import { AppService } from './vault/core/service/app.service'
import { ProvisionService } from './vault/core/service/provision.service'
import { VaultModule } from './vault/vault.module'

const INFRASTRUCTURE_MODULES = [
  LoggerModule,
  ConfigModule.forRoot({
    load: [load],
    isGlobal: true
  }),
  EncryptionModule.registerAsync({
    imports: [forwardRef(() => VaultModule)],
    inject: [ConfigService, AppService],
    useClass: EncryptionModuleOptionFactory
  }),
  OpenTelemetryModule.forRoot()
]

@Module({
  imports: [
    ...INFRASTRUCTURE_MODULES,

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
export class MainModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*')
  }
}

// IMPORTANT: To avoid application failure on the first boot due to a missing
// encryption keyring, we've set up a lite module that runs before the
// application bootstrap. This module has the correct dependencies to run the
// provision service in a standalone NestJS application before bootstrap.
//
// Why?
// We set the encryption keyring during the module configuration phase (before
// module initialization). If we provision it within the same application
// context, dependencies requiring encryption will fail because the keyring was
// already set as undefined.
@Module({
  imports: [...INFRASTRUCTURE_MODULES, VaultModule]
})
export class ProvisionModule implements OnModuleInit {
  constructor(private provisionService: ProvisionService) {}

  async onModuleInit() {
    await this.provisionService.provision()
  }
}
