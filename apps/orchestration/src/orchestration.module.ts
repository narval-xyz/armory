import { PolicyEngineModule } from '@app/orchestration/policy-engine/policy-engine.module'
import { TransactionEngineModule } from '@narval/transaction-engine-module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { load } from './orchestration.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true
    }),
    PolicyEngineModule,
    TransactionEngineModule
  ]
})
export class OrchestrationModule {}
