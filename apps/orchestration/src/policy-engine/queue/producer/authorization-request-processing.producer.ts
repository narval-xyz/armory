import { AUTHORIZATION_REQUEST_PROCESSING_QUEUE } from '@app/orchestration/orchestration.constant'
import {
  AuthorizationRequest,
  AuthorizationRequestStatus
} from '@app/orchestration/policy-engine/core/type/domain.type'
import { AuthorizationRequestRepository } from '@app/orchestration/policy-engine/persistence/repository/authorization-request.repository'
import { InjectQueue } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { Queue } from 'bull'

@Injectable()
export class AuthorizationRequestProcessingProducer {
  private logger = new Logger(AuthorizationRequestProcessingProducer.name)

  constructor(
    @InjectQueue(AUTHORIZATION_REQUEST_PROCESSING_QUEUE) private processingQueue: Queue,
    private authzRequestRepository: AuthorizationRequestRepository
  ) {}

  async add(authzRequest: AuthorizationRequest) {
    await this.processingQueue.add(
      {
        id: authzRequest.id
      },
      {
        jobId: authzRequest.id
      }
    )
  }

  async bulkAdd(requests: AuthorizationRequest[]) {
    const jobs = requests.map(({ id }) => ({
      data: { id },
      opts: {
        jobId: id
      }
    }))

    await this.processingQueue.addBulk(jobs)
  }

  async onApplicationBootstrap() {
    const requests = await this.authzRequestRepository.findByStatus(AuthorizationRequestStatus.CREATED)

    if (requests.length) {
      this.logger.log('Bulk add created authorization requests to the processing queue', {
        ids: requests.map(({ id }) => id)
      })

      await this.bulkAdd(requests)
    }
  }
}
