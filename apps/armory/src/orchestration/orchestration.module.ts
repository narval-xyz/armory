import { BullAdapter } from '@bull-board/api/bullAdapter'
import { BullBoardModule } from '@bull-board/nestjs'
import { HttpModule } from '@nestjs/axios'
import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConditionalModule } from '@nestjs/config'
import { Env, isEnv } from '../armory.config'
import { AUTHORIZATION_REQUEST_PROCESSING_QUEUE, DEFAULT_HTTP_MODULE_PROVIDERS } from '../armory.constant'
import { ClientModule } from '../client/client.module'
import { DataFeedModule } from '../data-feed/data-feed.module'
import { PolicyEngineModule } from '../policy-engine/policy-engine.module'
import { PriceModule } from '../price/price.module'
import { ClientIdGuard } from '../shared/guard/client-id.guard'
import { ClientSecretGuard } from '../shared/guard/client-secret.guard'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { TransferTrackingModule } from '../transfer-tracking/transfer-tracking.module'
import { AuthorizationRequestService } from './core/service/authorization-request.service'
import { AuthorizationRequestController } from './http/rest/controller/authorization-request.controller'
import { AuthorizationRequestApprovalRepository } from './persistence/repository/authorization-request-approval.repository'
import { AuthorizationRequestRepository } from './persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingConsumer } from './queue/consumer/authorization-request-processing.consumer'
import { AuthorizationRequestProcessingProducer } from './queue/producer/authorization-request-processing.producer'

const INFRASTRUCTURE_MODULES = [
  HttpModule,
  PersistenceModule,
  // TODO (@wcalderipe, 11/01/24): Figure out why can't I have a wrapper to
  // register both queue and board at the same time.
  //
  // Desired DevX: QueueModule.registerQueue({ name: "my-queue" })
  BullModule.registerQueue({
    name: AUTHORIZATION_REQUEST_PROCESSING_QUEUE
  }),
  ConditionalModule.registerWhen(
    BullBoardModule.forFeature({
      name: AUTHORIZATION_REQUEST_PROCESSING_QUEUE,
      adapter: BullAdapter
    }),
    () => isEnv(Env.DEVELOPMENT)
  )
]

const DOMAIN_MODULES = [ClientModule, TransferTrackingModule, PriceModule, DataFeedModule, PolicyEngineModule]

@Module({
  imports: [...INFRASTRUCTURE_MODULES, ...DOMAIN_MODULES],
  controllers: [AuthorizationRequestController],
  providers: [
    ...DEFAULT_HTTP_MODULE_PROVIDERS,
    ClientIdGuard,
    ClientSecretGuard,
    AuthorizationRequestService,
    AuthorizationRequestRepository,
    AuthorizationRequestApprovalRepository,
    AuthorizationRequestProcessingConsumer,
    AuthorizationRequestProcessingProducer
  ]
})
export class OrchestrationModule {}
