import { EncryptionModule } from '@narval/encryption-module'
import { HttpModule } from '@nestjs/axios'
import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { load } from '../policy-engine.config'
import { EncryptionModuleOptionFactory } from '../shared/factory/encryption-module-option.factory'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { EngineService } from './core/service/engine.service'
import { ProvisionService } from './core/service/provision.service'
import { SigningService } from './core/service/signing.service'
import { OpaService } from './opa/opa.service'
import { EngineRepository } from './persistence/repository/engine.repository'
import { EntityRepository } from './persistence/repository/entity.repository'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true
    }),
    HttpModule,
    KeyValueModule,
    EncryptionModule.registerAsync({
      imports: [EngineModule],
      inject: [ConfigService, EngineService],
      useClass: EncryptionModuleOptionFactory
    })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EngineRepository,
    EngineService,
    EntityRepository,
    OpaService,
    ProvisionService,
    SigningService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ],
  exports: [EngineService, ProvisionService]
})
export class EngineModule {}
