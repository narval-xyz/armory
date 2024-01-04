import { TransactionEngineModule } from '@narval/transaction-engine-module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PolicyEngineModule } from '@orchestration/policy-engine/policy-engine.module'

@Module({
  imports: [ConfigModule.forRoot(), PolicyEngineModule, TransactionEngineModule]
})
export class OrchestrationModule {}
