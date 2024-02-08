import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { load } from './app.config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AdminService } from './core/admin.service'
import { AdminController } from './http/rest/controller/admin.controller'
import { OpaService } from './opa/opa.service'
import { AdminRepository } from './persistence/repository/admin.repository'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true
    }),
    PersistenceModule
  ],
  controllers: [AppController, AdminController],
  providers: [
    AppService,
    AdminService,
    AdminRepository,
    OpaService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class AppModule {}
