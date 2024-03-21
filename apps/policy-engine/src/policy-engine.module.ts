import { EncryptionModule } from '@narval/encryption-module'
import { Module, OnApplicationBootstrap, ValidationPipe } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { BootstrapService } from './engine/core/service/bootstrap.service'
import { EngineService } from './engine/core/service/engine.service'
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
  constructor(private bootstrapService: BootstrapService) {}

  async onApplicationBootstrap() {
    await this.bootstrapService.boot()
  }
}
