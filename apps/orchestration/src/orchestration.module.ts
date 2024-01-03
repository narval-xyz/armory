import { TransactionEngineModule } from '@narval/transaction-engine-module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { HealthCheckModule } from './health-check/health-check.module'
import { PolicyEngineModule } from './policy-engine/policy-engine.module'

@Module({
  imports: [ConfigModule.forRoot(), PolicyEngineModule, TransactionEngineModule, HealthCheckModule]
})
export class OrchestrationModule {}
