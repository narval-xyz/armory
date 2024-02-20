import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { load } from './armory.config'
import { PolicyEngineModule } from './policy-engine/policy-engine.module'
import { QueueModule } from './shared/module/queue/queue.module'
import { StoreModule } from './store/store.module'
import { TransferTrackingModule } from './transfer-tracking/transfer-tracking.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true
    }),
    QueueModule.forRoot(),
    PolicyEngineModule,
    TransferTrackingModule,
    StoreModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    }
  ]
})
export class OrchestrationModule {}
