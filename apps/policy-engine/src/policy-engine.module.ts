import { ConfigModule, ConfigService } from '@narval/config-module'
import { EncryptionModule } from '@narval/encryption-module'
import { Module, OnApplicationBootstrap, OnModuleInit, ValidationPipe } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'
import { BootstrapService } from './engine/core/service/bootstrap.service'
import { EngineService } from './engine/core/service/engine.service'
import { ProvisionService } from './engine/core/service/provision.service'
import { EngineModule } from './engine/engine.module'
import { load } from './policy-engine.config'
import { EncryptionModuleOptionFactory } from './shared/factory/encryption-module-option.factory'

const INFRASTRUCTURE_MODULES = [
  ConfigModule.forRoot({
    load: [load],
    isGlobal: true
  }),
  EncryptionModule.registerAsync({
    imports: [EngineModule],
    inject: [ConfigService, EngineService],
    useClass: EncryptionModuleOptionFactory
  })
]

@Module({
  imports: [...INFRASTRUCTURE_MODULES, EngineModule],
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
export class PolicyEngineModule implements OnApplicationBootstrap {
  constructor(private bootstrapService: BootstrapService) {}

  async onApplicationBootstrap() {
    await this.bootstrapService.boot()
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
// already as undefined set.
@Module({
  imports: [...INFRASTRUCTURE_MODULES, EngineModule]
})
export class ProvisionModule implements OnModuleInit {
  constructor(private provisionService: ProvisionService) {}

  async onModuleInit() {
    await this.provisionService.provision()
  }
}
