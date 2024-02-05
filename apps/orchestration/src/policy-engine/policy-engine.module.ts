import { DataFeedModule } from '@app/orchestration/data-feed/data-feed.module'
import { AUTHORIZATION_REQUEST_PROCESSING_QUEUE } from '@app/orchestration/orchestration.constant'
import { AuthzApplicationClient } from '@app/orchestration/policy-engine/http/client/authz-application.client'
import { AuthorizationRequestController } from '@app/orchestration/policy-engine/http/rest/controller/authorization-request.controller'
import { PriceModule } from '@app/orchestration/price/price.module'
import { ApplicationExceptionFilter } from '@app/orchestration/shared/filter/application-exception.filter'
import { ZodExceptionFilter } from '@app/orchestration/shared/filter/zod-exception.filter'
import { PersistenceModule } from '@app/orchestration/shared/module/persistence/persistence.module'
import { TransferTrackingModule } from '@app/orchestration/transfer-tracking/transfer-tracking.module'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { BullBoardModule } from '@bull-board/nestjs'
import { HttpModule } from '@nestjs/axios'
import { BullModule } from '@nestjs/bull'
import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { AuthorizationRequestService } from './core/service/authorization-request.service'
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
    AuthzApplicationClient,
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
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class PolicyEngineModule {}
