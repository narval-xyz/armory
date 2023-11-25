import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionEngineModuleModule } from '@narval/transaction-engine-module';

@Module({
  imports: [TransactionEngineModuleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
