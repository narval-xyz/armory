import { Module } from '@nestjs/common'
import { TransactionEngineController } from './transaction-engine.controller'

@Module({
  controllers: [TransactionEngineController],
  providers: [],
  exports: []
})
export class TransactionEngineModule {}
