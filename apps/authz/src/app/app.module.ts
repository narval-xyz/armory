import { AdminService } from '@app/authz/app/core/admin.service'
import { AdminController } from '@app/authz/app/http/rest/controller/admin.controller'
import { AdminRepository } from '@app/authz/app/persistence/repository/admin.repository'
import { PersistenceModule } from '@app/authz/shared/module/persistence/persistence.module'
import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { load } from './app.config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { OpaService } from './opa/opa.service'

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
