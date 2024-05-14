import { ConfigModule } from '@narval/config-module'
import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { load } from './armory.config'
import { ManagedDataStoreModule } from './managed-data-store/managed-data-store.module'
import { OrchestrationModule } from './orchestration/orchestration.module'
import { QueueModule } from './shared/module/queue/queue.module'
import { TransferTrackingModule } from './transfer-tracking/transfer-tracking.module'

const INFRASTRUCTURE_MODULES = [
  ConfigModule.forRoot({
    load: [load],
    isGlobal: true
  }),
  QueueModule.forRoot()
]

const DOMAIN_MODULES = [OrchestrationModule, TransferTrackingModule, ManagedDataStoreModule]

@Module({
  imports: [...INFRASTRUCTURE_MODULES, ...DOMAIN_MODULES],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    }
  ]
})
export class ArmoryModule {}
