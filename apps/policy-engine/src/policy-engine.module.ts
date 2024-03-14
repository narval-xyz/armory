import { EncryptionModule } from '@narval/encryption-module'
import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { EngineService } from './engine/core/service/engine.service'
import { EngineModule } from './engine/engine.module'
import { load } from './policy-engine.config'
import { EncryptionModuleOptionFactory } from './shared/factory/encryption-module-option.factory'
import { TenantModule } from './tenant/tenant.module'

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
    EngineModule,
    TenantModule
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class PolicyEngineModule {}
