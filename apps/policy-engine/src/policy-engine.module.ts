import { ConfigModule, ConfigService } from '@narval/config-module'
import { EncryptionModule } from '@narval/encryption-module'
import { Module, OnApplicationBootstrap, ValidationPipe } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import { BootstrapService } from './engine/core/service/bootstrap.service'
import { EngineService } from './engine/core/service/engine.service'
import { ProvisionService } from './engine/core/service/provision.service'
import { EngineModule } from './engine/engine.module'
import { load } from './policy-engine.config'
import { EncryptionModuleOptionFactory } from './shared/factory/encryption-module-option.factory'

@Module({
  imports: [
    // Infrastructure
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true
    }),
    EncryptionModule.registerAsync({
      imports: [EngineModule],
      inject: [ConfigService, EngineService],
      useClass: EncryptionModuleOptionFactory
    }),

    // Domain
    EngineModule
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class PolicyEngineModule implements OnApplicationBootstrap {
  constructor(
    private provisionService: ProvisionService,
    private bootstrapService: BootstrapService
  ) {}

  async onApplicationBootstrap() {
    await this.provisionService.provision()
    await this.bootstrapService.boot()
  }
}
