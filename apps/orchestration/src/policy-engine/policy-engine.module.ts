import { AUTHORIZATION_REQUEST_PROCESSING_QUEUE } from '@app/orchestration/orchestration.constant'
import { ApplicationExceptionFilter } from '@app/orchestration/shared/filter/application-exception.filter'
import { PersistenceModule } from '@app/orchestration/shared/module/persistence/persistence.module'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { BullBoardModule } from '@bull-board/nestjs'
import { HttpModule } from '@nestjs/axios'
import { BullModule } from '@nestjs/bull'
import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER } from '@nestjs/core'
import { AuthorizationRequestService } from './core/service/authorization-request.service'
import { FacadeController } from './http/rest/controller/facade.controller'
import { AuthorizationRequestRepository } from './persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingConsumer } from './queue/consumer/authorization-request-processing.consumer'
import { AuthorizationRequestProcessingProducer } from './queue/producer/authorization-request-processing.producer'

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    PersistenceModule,
    // TODO (@wcalderipe, 11/01/24): Figure out why can I have a wrapper to
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
  controllers: [FacadeController],
  providers: [
    AuthorizationRequestService,
    AuthorizationRequestRepository,
    AuthorizationRequestProcessingConsumer,
    AuthorizationRequestProcessingProducer,
    {
      provide: APP_FILTER,
      useClass: ApplicationExceptionFilter
    }
  ]
})
export class PolicyEngineModule implements OnApplicationBootstrap {
  private logger = new Logger(PolicyEngineModule.name)

  constructor(private authzRequestProcessingProducer: AuthorizationRequestProcessingProducer) {}

  async onApplicationBootstrap() {
    this.logger.log('Policy Engine module boot')

    await this.authzRequestProcessingProducer.onApplicationBootstrap()
  }
}
