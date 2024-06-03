import { Module } from '@nestjs/common'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { AppService } from './core/service/app.service'
import { AdminCookieMiddleware } from './http/middleware/admin-cookie.middleware'
import { AppController } from './http/rest/controller/app.controller'
import { AppRepository } from './persistence/repository/app.repository'

@Module({
  imports: [PersistenceModule],
  providers: [AppService, AppRepository, AdminCookieMiddleware],
  controllers: [AppController],
  exports: [AppService, AdminCookieMiddleware]
})
export class AppModule {}
