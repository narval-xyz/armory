import { ConfigModule } from '@narval/config-module'
import { EncryptionService } from '@narval/encryption-module'
import { HttpLoggerMiddleware, LoggerModule, OpenTelemetryModule } from '@narval/nestjs-shared'
import { MiddlewareConsumer, Module, NestModule, OnModuleInit, ValidationPipe } from '@nestjs/common'
import { APP_PIPE, RouterModule } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'
import { AppRepository } from './app.repository'
import { AppService } from './app.service'
import { BrokerModule } from './broker/broker.module'
import { ClientModule } from './client/client.module'
import { load } from './main.config'
import { ProvisionService } from './provision.service'
import { KeyValueModule } from './shared/module/key-value/key-value.module'
import { PersistenceModule } from './shared/module/persistence/persistence.module'
import { VaultModule } from './vault/vault.module'

const INFRASTRUCTURE_MODULES = [
  LoggerModule,
  ConfigModule.forRoot({
    load: [load],
    isGlobal: true,
    cache: true
  }),
  OpenTelemetryModule.forRoot()
]

@Module({
  imports: [
    PersistenceModule.register({
      imports: [] // Specifically erase the imports, so we do NOT initialize the EncryptionModule
    }),
    KeyValueModule
  ],
  providers: [AppRepository, AppService, ProvisionService, { provide: EncryptionService, useValue: undefined }],
  exports: [AppService, ProvisionService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*')
  }
}

@Module({
  imports: [
    ...INFRASTRUCTURE_MODULES,
    AppModule,
    PersistenceModule.forRoot(),
    // Domain
    VaultModule,
    ClientModule,
    BrokerModule,
    RouterModule.register([
      {
        path: 'provider',
        module: BrokerModule
      }
    ])
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
  imports: [...INFRASTRUCTURE_MODULES, AppModule]
})
export class ProvisionModule implements OnModuleInit {
  constructor(private provisionService: ProvisionService) {}

  async onModuleInit() {
    await this.provisionService.provision()
  }
}
