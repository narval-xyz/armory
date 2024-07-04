import { LoggerService } from '@narval/nestjs-shared'
import {
  AuthorizationRequest,
  AuthorizationRequestProcessingJob,
  AuthorizationRequestStatus
} from '@narval/policy-engine-shared'
import { InjectQueue } from '@nestjs/bull'
import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { BackoffOptions, Job, Queue } from 'bull'
import {
  AUTHORIZATION_REQUEST_PROCESSING_QUEUE,
  AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS,
  AUTHORIZATION_REQUEST_PROCESSING_QUEUE_BACKOFF
} from '../../../armory.constant'
import { AuthorizationRequestRepository } from '../../persistence/repository/authorization-request.repository'

type JobOption = {
  attempts: number
  backoff: BackoffOptions
}

export const DEFAULT_JOB_OPTIONS: JobOption = {
  attempts: AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS,
  backoff: AUTHORIZATION_REQUEST_PROCESSING_QUEUE_BACKOFF
}

@Injectable()
export class AuthorizationRequestProcessingProducer implements OnApplicationBootstrap {
  constructor(
    @InjectQueue(AUTHORIZATION_REQUEST_PROCESSING_QUEUE)
    private processingQueue: Queue<AuthorizationRequestProcessingJob>,
    private authzRequestRepository: AuthorizationRequestRepository,
    private logger: LoggerService
  ) {}

  async add(authzRequest: AuthorizationRequest): Promise<Job<AuthorizationRequestProcessingJob>> {
    return this.processingQueue.add(
      {
        id: authzRequest.id
      },
      {
        jobId: authzRequest.id,
        ...DEFAULT_JOB_OPTIONS
      }
    )
  }

  async bulkAdd(requests: AuthorizationRequest[]): Promise<Job<AuthorizationRequestProcessingJob>[]> {
    const jobs = requests.map(({ id }) => ({
      data: { id },
      opts: {
        jobId: id,
        ...DEFAULT_JOB_OPTIONS
      }
    }))

    return this.processingQueue.addBulk(jobs)
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
