import { AUTHORIZATION_REQUEST_PROCESSING_QUEUE } from '@app/orchestration/orchestration.constant'
import { AuthorizationRequestService } from '@app/orchestration/policy-engine/core/service/authorization-request.service'
import { OnQueueActive, OnQueueCompleted, Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'

@Processor(AUTHORIZATION_REQUEST_PROCESSING_QUEUE)
export class AuthorizationRequestProcessingConsumer {
  private logger = new Logger(AuthorizationRequestProcessingConsumer.name)

  constructor(private authzService: AuthorizationRequestService) {}

  @Process()
  async process(job: Job<unknown>) {
    this.logger.log('Processing authorization request job', {
      id: job.id,
      data: job.data
    })

    await this.authzService.process(job.id.toString())

    return true
  }

  @OnQueueActive()
  onActive(job: Job<unknown>) {
    this.logger.log('Consuming authorization request job', {
      id: job.id,
      data: job.data
    })
  }

  @OnQueueCompleted()
  onCompleted(job: Job<unknown>, result: unknown) {
    this.logger.log('Completed authorization request job', {
      id: job.id,
      data: job.data,
      result
    })

    this.authzService.complete(job.id.toString())
  }
}
