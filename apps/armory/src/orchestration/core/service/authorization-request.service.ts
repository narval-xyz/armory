import { LoggerService, MetricService, OTEL_ATTR_CLIENT_ID } from '@narval/nestjs-shared'
import {
  Action,
  AuthorizationRequest,
  AuthorizationRequestError,
  AuthorizationRequestStatus,
  CreateAuthorizationRequest,
  Decision,
  JwtString
} from '@narval/policy-engine-shared'
import { Intent, Intents } from '@narval/transaction-request-intent'
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { Counter } from '@opentelemetry/api'
import { v4 as uuid } from 'uuid'
import { AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS, FIAT_ID_USD } from '../../../armory.constant'
import { FeedService } from '../../../data-feed/core/service/feed.service'
import { ClusterService } from '../../../policy-engine/core/service/cluster.service'
import { PriceService } from '../../../price/core/service/price.service'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { TransferTrackingService } from '../../../transfer-tracking/core/service/transfer-tracking.service'
import { AuthorizationRequestApprovalRepository } from '../../persistence/repository/authorization-request-approval.repository'
import { AuthorizationRequestRepository } from '../../persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingProducer } from '../../queue/producer/authorization-request-processing.producer'
import { AuthorizationRequestAlreadyProcessingException } from '../exception/authorization-request-already-processing.exception'

const getStatus = (decision: string): AuthorizationRequestStatus => {
  const statuses: Map<string, AuthorizationRequestStatus> = new Map([
    [Decision.PERMIT, AuthorizationRequestStatus.PERMITTED],
    [Decision.FORBID, AuthorizationRequestStatus.FORBIDDEN],
    [Decision.CONFIRM, AuthorizationRequestStatus.APPROVING]
  ])

  const status = statuses.get(decision)

  if (status) {
    return status
  }

  throw Error('Unknown status returned from the AuthZ')
}

@Injectable()
export class AuthorizationRequestService {
  private createCounter: Counter
  private evaluationCounter: Counter

  constructor(
    private authzRequestRepository: AuthorizationRequestRepository,
    private authzRequestApprovalRepository: AuthorizationRequestApprovalRepository,
    private authzRequestProcessingProducer: AuthorizationRequestProcessingProducer,
    private transferTrackingService: TransferTrackingService,
    private priceService: PriceService,
    private clusterService: ClusterService,
    private feedService: FeedService,
    private logger: LoggerService,
    @Inject(MetricService) private metricService: MetricService
  ) {
    this.createCounter = this.metricService.createCounter('authorization_request_create_count')
    this.evaluationCounter = this.metricService.createCounter('authorization_request_evaluation_count')
  }

  async create(input: CreateAuthorizationRequest): Promise<AuthorizationRequest> {
    this.createCounter.add(1, { [OTEL_ATTR_CLIENT_ID]: input.clientId })

    const now = new Date()

    const authzRequest = await this.authzRequestRepository.create({
      id: input.id || uuid(),
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now,
      ...input
    })

    await this.authzRequestProcessingProducer.add(authzRequest)

    return authzRequest
  }

  async findById(id: string): Promise<AuthorizationRequest | null> {
    return this.authzRequestRepository.findById(id)
  }

  async process(id: string, attemptsMade: number) {
    const authzRequest = await this.authzRequestRepository.findById(id)

    if (authzRequest) {
      if (
        attemptsMade >= AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS &&
        authzRequest.status === AuthorizationRequestStatus.PROCESSING
      ) {
        throw new AuthorizationRequestAlreadyProcessingException(authzRequest)
      }

      await this.authzRequestRepository.update({
        id,
        clientId: authzRequest.clientId,
        status: AuthorizationRequestStatus.PROCESSING
      })

      await this.evaluate(authzRequest)
    }
  }

  async changeStatus(id: string, status: AuthorizationRequestStatus): Promise<AuthorizationRequest> {
    return this.authzRequestRepository.update({
      id,
      status
    })
  }

  async approve(requestId: string, sig: JwtString): Promise<AuthorizationRequest | null> {
    try {
      const authzRequest = await this.authzRequestRepository.update({
        id: requestId,
        approvals: [sig],
        status: AuthorizationRequestStatus.APPROVING
      })

      await this.evaluate(authzRequest)
    } catch (error) {
      this.logger.error('Error approving authorization request', {
        requestId,
        sig,
        error
      })
      await this.authzRequestApprovalRepository.updateMany({
        requestId,
        sig,
        error
      })
    }

    return this.authzRequestRepository.findById(requestId)
  }

  bigIntWithError(value: string | number): bigint {
    try {
      return BigInt(value)
    } catch (error) {
      throw new ApplicationException({
        message: 'Invalid BigInt value',
        context: { value },
        origin: error,
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST
      })
    }
  }

  async evaluate(input: AuthorizationRequest): Promise<AuthorizationRequest> {
    this.logger.log('Start authorization request evaluation', {
      requestId: input.id,
      clientId: input.clientId,
      status: input.status,
      request: input.request
    })

    const feeds = await this.feedService.gather(input)

    const evaluation = await this.clusterService.evaluate(input.clientId, {
      authentication: input.authentication,
      approvals: input.approvals,
      metadata: input.metadata,
      request: input.request,
      feeds,
      sessionId: uuid() // a random sessionId, used for MPC
    })

    const status = getStatus(evaluation.decision)

    this.evaluationCounter.add(1, {
      [OTEL_ATTR_CLIENT_ID]: input.clientId,
      'domain.authorization_request.status': status
    })

    // NOTE: we will track the transfer before we update the status to PERMITTED so that we don't have a brief window where a second transfer can come in before the history is tracked.
    // TODO: (@wcalderipe, 01/02/24) Move to the TransferTrackingService.
    if (input.request.action === Action.SIGN_TRANSACTION && status === AuthorizationRequestStatus.PERMITTED) {
      // TODO: (@wcalderipe, 08/02/24) Remove the cast `as Intent`.
      const intent = evaluation.transactionRequestIntent as Intent

      if (intent && (Intents.TRANSFER_NATIVE === intent.type || Intents.TRANSFER_ERC20 === intent.type)) {
        const transferPrices = await this.priceService.getPrices({
          from: [intent.token],
          to: [FIAT_ID_USD]
        })

        // This should never happen, a successful permit always has a principal, so this is just a fail-safe check.
        if (!evaluation.principal?.userId) {
          throw new ApplicationException({
            message: 'Principal userId not found',
            context: {
              evaluation
            },
            suggestedHttpStatusCode: HttpStatus.BAD_REQUEST
          })
        }
        const transfer = {
          resourceId: input.request.resourceId,
          clientId: input.clientId,
          requestId: input.id,
          from: intent.from,
          to: intent.to,
          token: intent.token,
          chainId: input.request.transactionRequest.chainId,
          initiatedBy: evaluation.principal?.userId,
          createdAt: new Date(),
          amount: this.bigIntWithError(intent.amount),
          rates: transferPrices[intent.token] || {}
        }

        await this.transferTrackingService.track(transfer)
      }
    }

    const authzRequest = await this.authzRequestRepository.update({
      id: input.id,
      clientId: input.clientId,
      status,
      evaluations: [
        {
          id: uuid(),
          decision: evaluation.decision,
          signature: evaluation.accessToken?.value || null,
          approvalRequirements: evaluation.approvals,
          transactionRequestIntent: evaluation.transactionRequestIntent,
          createdAt: new Date()
        }
      ]
    })

    this.logger.log('Authorization request status updated', {
      clientId: authzRequest.clientId,
      id: authzRequest.id,
      status: authzRequest.status,
      evaluations: authzRequest.evaluations
    })

    return authzRequest
  }

  async fail(id: string, error: AuthorizationRequestError): Promise<AuthorizationRequest> {
    const request = await this.authzRequestRepository.findById(id)

    if (request) {
      return this.authzRequestRepository.update({
        id,
        clientId: request.clientId,
        status: AuthorizationRequestStatus.FAILED,
        errors: [error]
      })
    }

    throw new ApplicationException({
      message: 'Could not find the authorization request to fail',
      suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
      context: { id }
    })
  }
}
