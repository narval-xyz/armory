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
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { AUTHORIZATION_REQUEST_PROCESSING_QUEUE_ATTEMPTS, FIAT_ID_USD } from '../../../armory.constant'
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
  private logger = new Logger(AuthorizationRequestService.name)

  constructor(
    private authzRequestRepository: AuthorizationRequestRepository,
    private authzRequestApprovalRepository: AuthorizationRequestApprovalRepository,
    private authzRequestProcessingProducer: AuthorizationRequestProcessingProducer,
    private transferTrackingService: TransferTrackingService,
    private priceService: PriceService,
    private clusterService: ClusterService
  ) {}

  async create(input: CreateAuthorizationRequest): Promise<AuthorizationRequest> {
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
        approvals: [sig]
      })

      await this.evaluate(authzRequest)
    } catch (error) {
      await this.authzRequestApprovalRepository.updateMany({
        requestId,
        sig,
        error
      })
    }

    return this.authzRequestRepository.findById(requestId)
  }

  async evaluate(input: AuthorizationRequest): Promise<AuthorizationRequest> {
    this.logger.log('Start authorization request evaluation', {
      requestId: input.id,
      clientId: input.clientId,
      status: input.status,
      request: input.request
    })

    // TODO: (@wcalderipe, 17/05/24) I'm turning off the data feeds gathering
    // because it's not included in V1's scope. Additionally, I found that nock
    // isn't blocking connections to certain hosts. As a result, the
    // authorization E2E tests were making requests to Coingecko to get
    // prices through the PriceService.
    // const feeds = await this.feedService.gather(input)
    const evaluation = await this.clusterService.evaluate(input.clientId, {
      authentication: input.authentication,
      approvals: input.approvals,
      metadata: input.metadata,
      request: input.request,
      feeds: [],
      sessionId: uuid() // a random sessionId, used for MPC
    })

    const status = getStatus(evaluation.decision)

    const authzRequest = await this.authzRequestRepository.update({
      id: input.id,
      clientId: input.clientId,
      status,
      evaluations: [
        {
          id: uuid(),
          decision: evaluation.decision,
          signature: evaluation.accessToken?.value || null,
          createdAt: new Date()
        }
      ]
    })

    // TODO: (@wcalderipe, 01/02/24) Move to the TransferTrackingService.
    if (authzRequest.request.action === Action.SIGN_TRANSACTION && status === AuthorizationRequestStatus.PERMITTED) {
      // TODO: (@wcalderipe, 08/02/24) Remove the cast `as Intent`.
      const intent = evaluation.transactionRequestIntent as Intent
      if (intent && intent.type === Intents.TRANSFER_NATIVE) {
        const transferPrices = await this.priceService.getPrices({
          from: [intent.token],
          to: [FIAT_ID_USD]
        })

        const transfer = {
          clientId: authzRequest.clientId,
          requestId: authzRequest.id,
          from: intent.from,
          to: intent.to,
          token: intent.token,
          chainId: authzRequest.request.transactionRequest.chainId,
          // TODO: (@mattschoch) Get real initiator? -- this used to reference publicKey but
          // should actually pull data out of a decoded JWT
          initiatedBy: authzRequest.authentication,
          createdAt: new Date(),
          amount: BigInt(intent.amount),
          rates: transferPrices[intent.token] || {}
        }

        await this.transferTrackingService.track(transfer)
      }
    }

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
