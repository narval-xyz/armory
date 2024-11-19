import { LoggerService, OTEL_ATTR_CLIENT_ID, TraceService } from '@narval/nestjs-shared'
import {
  AuthorizationRequest,
  AuthorizationRequestProcessingJob,
  AuthorizationRequestStatus
} from '@narval/policy-engine-shared'
import { InjectQueue } from '@nestjs/bull'
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { BackoffOptions, Job, Queue } from 'bull'
import {
  AUTHORIZATION_REQUEST_PROCESSING_QUEUE,
  AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS,
  AUTHORIZATION_REQUEST_PROCESSING_QUEUE_BACKOFF
} from '../../../armory.constant'
import { OTEL_ATTR_JOB_ID } from '../../orchestration.constant'
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
    private logger: LoggerService,
    @Inject(TraceService) private traceService: TraceService
  ) {}

  async add(authzRequest: AuthorizationRequest): Promise<Job<AuthorizationRequestProcessingJob>> {
    const span = this.traceService.startSpan(`${AuthorizationRequestProcessingProducer.name}.add`, {
      attributes: { [OTEL_ATTR_CLIENT_ID]: authzRequest.id }
    })

    const job = await this.processingQueue.add(
      {
        id: authzRequest.id
      },
      {
        jobId: authzRequest.id,
        ...DEFAULT_JOB_OPTIONS
      }
    )

    span.setAttribute(OTEL_ATTR_JOB_ID, job.id).end()

    return job
  }

  async bulkAdd(requests: AuthorizationRequest[]): Promise<Job<AuthorizationRequestProcessingJob>[]> {
    const span = this.traceService.startSpan(`${AuthorizationRequestProcessingProducer.name}.bulkAdd`)

    const jobs = requests.map(({ id }) => ({
      data: { id },
      opts: {
        jobId: id,
        ...DEFAULT_JOB_OPTIONS
      }
    }))

    const addedJobs = await this.processingQueue.addBulk(jobs)

    span.end()

    return addedJobs
  }

  async onApplicationBootstrap() {
    const span = this.traceService.startSpan(`${AuthorizationRequestProcessingProducer.name}.onApplicationBootstrap`)

    const requests = await this.authzRequestRepository.findByStatus(AuthorizationRequestStatus.CREATED)

    if (requests.length) {
      this.logger.log('Bulk add created authorization requests to the processing queue', {
        ids: requests.map(({ id }) => id)
      })

      await this.bulkAdd(requests)
    }

    span.end()
  }
}
