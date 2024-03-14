import { EncryptionModule } from '@narval/encryption-module'
import { HttpModule } from '@nestjs/axios'
import { Module, ValidationPipe, forwardRef } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { load } from '../main.config'
import { EncryptionModuleOptionFactory } from '../shared/factory/encryption-module-option.factory'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { AppService } from './core/service/app.service'
import { ProvisionService } from './core/service/provision.service'
import { SigningService } from './core/service/signing.service'
import { AppRepository } from './persistence/repository/app.repository'
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
    })
  ],
  controllers: [VaultController],
  providers: [
    AppService,
    AppRepository,
    VaultService,
    ProvisionService,
    SigningService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ],
  exports: [AppService, ProvisionService]
})
export class VaultModule {}
