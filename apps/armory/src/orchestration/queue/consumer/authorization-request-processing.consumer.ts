import { LoggerService, TraceService } from '@narval/nestjs-shared'
import { AuthorizationRequestProcessingJob } from '@narval/policy-engine-shared'
import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull'
import { Inject } from '@nestjs/common'
import { SpanStatusCode } from '@opentelemetry/api'
import { Job } from 'bull'
import { v4 as uuid } from 'uuid'
import {
  AUTHORIZATION_REQUEST_PROCESSING_QUEUE,
  AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS
} from '../../../armory.constant'
import { ClusterNotFoundException } from '../../../policy-engine/core/exception/cluster-not-found.exception'
import { ConsensusAgreementNotReachException } from '../../../policy-engine/core/exception/consensus-agreement-not-reach.exception'
import { InvalidAttestationSignatureException } from '../../../policy-engine/core/exception/invalid-attestation-signature.exception'
import { UnreachableClusterException } from '../../../policy-engine/core/exception/unreachable-cluster.exception'
import { AuthorizationRequestAlreadyProcessingException } from '../../core/exception/authorization-request-already-processing.exception'
import { AuthorizationRequestService } from '../../core/service/authorization-request.service'
import { OTEL_ATTR_JOB_ID } from '../../orchestration.constant'

const OTEL_ATTR_JOB_ATTEMPS_MADE = 'job.attempts_made'
const OTEL_ATTR_JOB_FAILED = 'job.failed'
const OTEL_ATTR_JOB_MAX_RETRIES = 'job.max_retries'
const OTEL_ATTR_JOB_RETRIED = 'job.retried'

@Processor(AUTHORIZATION_REQUEST_PROCESSING_QUEUE)
export class AuthorizationRequestProcessingConsumer {
  constructor(
    private authzService: AuthorizationRequestService,
    private logger: LoggerService,
    @Inject(TraceService) private traceService: TraceService
  ) {}

  @Process()
  async process(job: Job<AuthorizationRequestProcessingJob>) {
    this.logger.log('Processing authorization request job', {
      id: job.id,
      data: job.data
    })

    const span = this.traceService.startSpan(`${AuthorizationRequestProcessingConsumer.name}.process`, {
      attributes: { [OTEL_ATTR_JOB_ID]: job.id }
    })

    try {
      await this.authzService.process(job.id.toString(), job.attemptsMade)
    } catch (error) {
      span.recordException(error)

      // Short-circuits the retry mechanism on unrecoverable domain errors.
      //
      // IMPORTANT: To stop retrying a job in Bull, the process must return an
      // error instance. If the process throws, it'll automaticaly retry.
      if (this.isUnrecoverableError(error)) {
        return error
      }

      // If the error ins't recoverable, set the span status to error.
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      })

      throw error
    } finally {
      span.end()
    }
  }

  private isUnrecoverableError(error: Error): boolean {
    switch (error.constructor) {
      case ClusterNotFoundException:
      case ConsensusAgreementNotReachException:
      case UnreachableClusterException:
      case InvalidAttestationSignatureException:
      case AuthorizationRequestAlreadyProcessingException:
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
  async onCompleted(job: Job<AuthorizationRequestProcessingJob>, result: unknown) {
    const span = this.traceService.startSpan(`${AuthorizationRequestProcessingConsumer.name}.onCompleted`, {
      attributes: { [OTEL_ATTR_JOB_ID]: job.id }
    })

    if (result instanceof Error) {
      this.logger.error('Stop processing authorization request due to unrecoverable error', result)

      span.setAttribute(OTEL_ATTR_JOB_FAILED, true).end()

      await this.authzService.fail(job.id.toString(), {
        ...result,
        id: uuid()
      })

      return
    }

    this.logger.log('Completed authorization request job', {
      id: job.id,
      data: job.data,
      result
    })

    span.setAttribute(OTEL_ATTR_JOB_FAILED, false).end()
  }

  @OnQueueFailed()
  async onFailure(job: Job<AuthorizationRequestProcessingJob>, error: Error) {
    const log = {
      id: job.id,
      attemptsMade: job.attemptsMade,
      maxAttempts: AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS,
      error
    }

    const span = this.traceService.startSpan(`${AuthorizationRequestProcessingConsumer.name}.onCompleted`, {
      attributes: {
        [OTEL_ATTR_JOB_ID]: log.id,
        [OTEL_ATTR_JOB_MAX_RETRIES]: log.maxAttempts,
        [OTEL_ATTR_JOB_ATTEMPS_MADE]: log.attemptsMade
      }
    })

    if (job.attemptsMade >= AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS) {
      this.logger.error('Process authorization request failed', log)
      span.setAttribute(OTEL_ATTR_JOB_RETRIED, false)

      await this.authzService.fail(job.id.toString(), {
        id: uuid(),
        ...error
      })
    } else {
      this.logger.log('Retrying to process authorization request', log)
      span.setAttribute(OTEL_ATTR_JOB_RETRIED, true)
    }

    span.end()
  }
}
