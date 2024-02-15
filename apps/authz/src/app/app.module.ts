import { HttpModule } from '@nestjs/axios'
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
import { EntityRepository } from './persistence/repository/entity.repository'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true
    }),
    HttpModule,
    PersistenceModule
  ],
  controllers: [AppController, AdminController],
  providers: [
    AppService,
    AdminService,
    OpaService,
    EntityRepository,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class AppModule {}
