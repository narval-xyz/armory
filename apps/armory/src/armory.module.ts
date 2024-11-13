import { ConfigModule } from '@narval/config-module'
import { HttpLoggerMiddleware, LoggerModule, OpenTelemetryModule, TrackClientIdMiddleware } from '@narval/nestjs-shared'
import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { AppService } from './app/core/service/app.service'
import { load } from './armory.config'
import { ArmoryController } from './armory.controller'
import { ClientModule } from './client/client.module'
import { ManagedDataStoreModule } from './managed-data-store/managed-data-store.module'
import { OrchestrationModule } from './orchestration/orchestration.module'
import { QueueModule } from './shared/module/queue/queue.module'
import { TransferTrackingModule } from './transfer-tracking/transfer-tracking.module'

const INFRASTRUCTURE_MODULES = [
  LoggerModule,
  ConfigModule.forRoot({
    load: [load],
    isGlobal: true
  }),
  QueueModule.forRoot(),
  OpenTelemetryModule.forRoot()
]

const DOMAIN_MODULES = [AppModule, OrchestrationModule, TransferTrackingModule, ManagedDataStoreModule, ClientModule]

@Module({
  imports: [...INFRASTRUCTURE_MODULES, ...DOMAIN_MODULES],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    }
  ],
  controllers: [ArmoryController]
})
export class ArmoryModule implements NestModule {
  constructor(private appService: AppService) {}

  async onModuleInit() {
    await this.appService.provision()
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggerMiddleware, TrackClientIdMiddleware).forRoutes('*')
  }
}
