import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { AdminModule } from './admin/admin.module'
import { load } from './armory.config'
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
    AdminModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    }
  ]
})
export class ArmoryModule {}
