import { PolicyEngineModule } from '@app/orchestration/policy-engine/policy-engine.module'
import { TransferTrackingModule } from '@app/orchestration/transfer-tracking/transfer-tracking.module'
import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { load } from './orchestration.config'
import { QueueModule } from './shared/module/queue/queue.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true
    }),
    QueueModule.forRoot(),
    PolicyEngineModule,
    TransferTrackingModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    }
  ]
})
export class OrchestrationModule {}
