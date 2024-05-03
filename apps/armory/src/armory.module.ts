import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { load } from './armory.config'
import { ManagedDataStore } from './managed-data-store/managed-data-store.module'
import { OrchestrationModule } from './orchestration/orchestration.module'
import { QueueModule } from './shared/module/queue/queue.module'
import { TransferTrackingModule } from './transfer-tracking/transfer-tracking.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load],
      isGlobal: true
    }),
    QueueModule.forRoot(),
    OrchestrationModule,
    TransferTrackingModule,
    ManagedDataStore
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    }
  ]
})
export class ArmoryModule {}
