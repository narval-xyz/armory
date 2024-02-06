import {
  AUTHORIZATION_REQUEST_PROCESSING_QUEUE,
  AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS
} from '@app/orchestration/orchestration.constant'
import { ClusterNotFoundException } from '@app/orchestration/policy-engine/core/exception/cluster-not-found.exception'
import { EvaluationConsensusException } from '@app/orchestration/policy-engine/core/exception/evaluation-consensus.exception'
import { InvalidAttestationSignatureException } from '@app/orchestration/policy-engine/core/exception/invalid-attestation-signature.exception'
import { UnreachableClusterException } from '@app/orchestration/policy-engine/core/exception/unreachable-cluster.exception'
import { AuthorizationRequestService } from '@app/orchestration/policy-engine/core/service/authorization-request.service'
import {
  AuthorizationRequestProcessingJob,
  AuthorizationRequestStatus
} from '@app/orchestration/policy-engine/core/type/domain.type'
import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'

@Processor(AUTHORIZATION_REQUEST_PROCESSING_QUEUE)
export class AuthorizationRequestProcessingConsumer {
  private logger = new Logger(AuthorizationRequestProcessingConsumer.name)

  constructor(private authzService: AuthorizationRequestService) {}

  @Process()
  async process(job: Job<AuthorizationRequestProcessingJob>) {
    this.logger.log('Processing authorization request job', {
      id: job.id,
      data: job.data
    })

    try {
      await this.authzService.process(job.id.toString())
    } catch (error) {
      // Short-circuits the retry mechanism on unrecoverable domain errors.
      //
      // IMPORTANT: To stop retrying a job in Bull, the process must return an
      // error instance.
      if (this.isUnrecoverableError(error)) {
        return error
      }

      throw error
    }
  }

  private isUnrecoverableError(error: Error): boolean {
    switch (error.constructor) {
      case ClusterNotFoundException:
      case EvaluationConsensusException:
      case UnreachableClusterException:
      case InvalidAttestationSignatureException:
        return true
      default:
        return false
    }
  }

  @OnQueueActive()
  onActive(job: Job<AuthorizationRequestProcessingJob>) {
    this.logger.log('Consuming authorization request job', {
      id: job.id,
      data: job.data
    })
  }

  @OnQueueCompleted()
  onCompleted(job: Job<AuthorizationRequestProcessingJob>, result: unknown) {
    if (result instanceof Error) {
      this.logger.error('Stop processing authorization request due to unrecoverable error', result)
      return
    }

    this.logger.log('Completed authorization request job', {
      id: job.id,
      data: job.data,
      result
    })

    this.authzService.complete(job.id.toString())
  }

  @OnQueueFailed()
  async onFailure(job: Job<AuthorizationRequestProcessingJob>, error: Error) {
    const log = {
      id: job.id,
      attemptsMade: job.attemptsMade,
      maxAttempts: AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS,
      error
    }

    if (job.attemptsMade >= AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS) {
      this.logger.error('Process authorization request failed', log)

      await this.authzService.changeStatus(job.id.toString(), AuthorizationRequestStatus.FAILED)
    } else {
      this.logger.log('Retrying to process authorization request', log)
    }
  }
}
