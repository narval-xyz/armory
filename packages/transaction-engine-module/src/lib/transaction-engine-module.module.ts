import { Module } from '@nestjs/common';
import { TransactionEngineModuleController } from './transaction-engine-module.controller';
import { TransactionEngineModuleService } from './transaction-engine-module.service';

@Module({
  controllers: [TransactionEngineModuleController],
  providers: [TransactionEngineModuleService],
  exports: [TransactionEngineModuleService],
})
export class TransactionEngineModuleModule {}
