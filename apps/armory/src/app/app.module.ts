import { Module } from '@nestjs/common'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { AppService } from './core/service/app.service'
import { AppController } from './http/rest/controller/app.controller'
import { AppRepository } from './persistence/repository/app.repository'

@Module({
  imports: [PersistenceModule],
  providers: [AppService, AppRepository],
  controllers: [AppController],
  exports: [AppService]
})
export class AppModule {}
