import { HttpModule } from '@nestjs/axios'
import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { EncryptionModule } from '../encryption/encryption.module'
import { load } from '../policy-engine.config'
import { KeyValueModule } from '../shared/module/key-value/key-value.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AdminService } from './core/service/admin.service'
import { EngineService } from './core/service/engine.service'
import { TenantService } from './core/service/tenant.service'
import { AdminController } from './http/rest/controller/admin.controller'
import { TenantController } from './http/rest/controller/tenant.controller'
import { OpaService } from './opa/opa.service'
import { EngineRepository } from './persistence/repository/engine.repository'
import { EntityRepository } from './persistence/repository/entity.repository'
import { TenantRepository } from './persistence/repository/tenant.repository'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true
    }),
    HttpModule,
    EncryptionModule,
    KeyValueModule
  ],
  controllers: [AppController, AdminController, TenantController],
  providers: [
    AppService,
    AdminService,
    OpaService,
    EngineRepository,
    EngineService,
    EntityRepository,
    TenantRepository,
    TenantService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class AppModule {}
