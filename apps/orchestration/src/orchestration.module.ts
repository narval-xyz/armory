import { PolicyEngineModule } from '@app/orchestration/policy-engine/policy-engine.module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { load } from './orchestration.config'
import { QueueModule } from './shared/module/queue/queue.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true
    }),
    QueueModule.forRoot(),
    PolicyEngineModule
  ]
})
export class OrchestrationModule {}
