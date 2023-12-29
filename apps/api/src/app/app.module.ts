import { Module } from '@nestjs/common'

import { TransactionEngineModuleModule } from '@narval/transaction-engine-module'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [TransactionEngineModuleModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
