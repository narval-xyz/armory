import { BullAdapter } from '@bull-board/api/bullAdapter'
import { BullBoardModule } from '@bull-board/nestjs'
import { HttpModule } from '@nestjs/axios'
import { BullModule } from '@nestjs/bull'
import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'
import { AUTHORIZATION_REQUEST_PROCESSING_QUEUE } from '../armory.constant'
import { DataFeedModule } from '../data-feed/data-feed.module'
import { PriceModule } from '../price/price.module'
import { ApplicationExceptionFilter } from '../shared/filter/application-exception.filter'
import { ZodExceptionFilter } from '../shared/filter/zod-exception.filter'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { TransferTrackingModule } from '../transfer-tracking/transfer-tracking.module'
import { AuthorizationRequestService } from './core/service/authorization-request.service'
import { ClusterService } from './core/service/cluster.service'
import { PolicyEngineClient } from './http/client/policy-engine.client'
import { AuthorizationRequestController } from './http/rest/controller/authorization-request.controller'
import { AuthorizationRequestRepository } from './persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingConsumer } from './queue/consumer/authorization-request-processing.consumer'
import { AuthorizationRequestProcessingProducer } from './queue/producer/authorization-request-processing.producer'

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    PersistenceModule,
    TransferTrackingModule,
    PriceModule,
    DataFeedModule,
    // TODO (@wcalderipe, 11/01/24): Figure out why can't I have a wrapper to
    // register both queue and board at the same time.
    //
    // Desired DevX: QueueModule.registerQueue({ name: "my-queue" })
    BullModule.registerQueue({
      name: AUTHORIZATION_REQUEST_PROCESSING_QUEUE
    }),
    BullBoardModule.forFeature({
      name: AUTHORIZATION_REQUEST_PROCESSING_QUEUE,
      adapter: BullAdapter
    })
  ],
  controllers: [AuthorizationRequestController],
  providers: [
    AuthorizationRequestService,
    AuthorizationRequestRepository,
    AuthorizationRequestProcessingConsumer,
    AuthorizationRequestProcessingProducer,
    PolicyEngineClient,
    ClusterService,
    {
      provide: APP_FILTER,
      useClass: ApplicationExceptionFilter
    },
    {
      provide: APP_FILTER,
      useClass: ZodExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    },
    {
      // DEPRECATE: Use Zod generated DTOs to validate request and responses.
      provide: APP_PIPE,
      useClass: ValidationPipe
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    }
  ],
  exports: [PolicyEngineClient]
})
export class OrchestrationModule {}
