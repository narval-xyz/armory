import { Action, Decision } from '@narval/policy-engine-shared'
import { Intent, Intents } from '@narval/transaction-request-intent'
import { Injectable, Logger } from '@nestjs/common'
import { SetOptional } from 'type-fest'
import { v4 as uuid } from 'uuid'
import { FIAT_ID_USD } from '../../../armory.constant'
import { FeedService } from '../../../data-feed/core/service/feed.service'
import { PriceService } from '../../../price/core/service/price.service'
import { TransferTrackingService } from '../../../transfer-tracking/core/service/transfer-tracking.service'
import {
  Approval,
  AuthorizationRequest,
  AuthorizationRequestStatus,
  CreateAuthorizationRequest
} from '../../core/type/domain.type'
import { AuthorizationRequestRepository } from '../../persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingProducer } from '../../queue/producer/authorization-request-processing.producer'
import { AuthorizationRequestAlreadyProcessingException } from '../exception/authorization-request-already-processing.exception'
import { ClusterService } from './cluster.service'

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
    private authzRequestProcessingProducer: AuthorizationRequestProcessingProducer,
    private transferTrackingService: TransferTrackingService,
    private priceService: PriceService,
    private feedService: FeedService,
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

  async process(id: string) {
    const authzRequest = await this.authzRequestRepository.findById(id)

    if (authzRequest) {
      await this.authzRequestRepository.update({
        id: authzRequest.id,
        orgId: authzRequest.orgId,
        status: AuthorizationRequestStatus.PROCESSING
      })

      await this.evaluate(authzRequest)
    }
  }

  async changeStatus(id: string, status: AuthorizationRequestStatus): Promise<AuthorizationRequest> {
    return this.authzRequestRepository.update({
      id: id,
      status
    })
  }

  async approve(id: string, approval: SetOptional<Approval, 'id' | 'createdAt'>): Promise<AuthorizationRequest> {
    const authzRequest = await this.authzRequestRepository.update({
      id: id,
      approvals: [
        {
          id: approval.id || uuid(),
          createdAt: approval.createdAt || new Date(),
          ...approval
        }
      ]
    })

    return this.evaluate(authzRequest)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async complete(id: string) {}

  async evaluate(input: AuthorizationRequest): Promise<AuthorizationRequest> {
    if (input.status === AuthorizationRequestStatus.PROCESSING) {
      throw new AuthorizationRequestAlreadyProcessingException(input)
    }

    this.logger.log('Start authorization request evaluation', {
      requestId: input.id,
      orgId: input.orgId,
      status: input.status
    })

    const feeds = await this.feedService.gather(input)
    const evaluation = await this.clusterService.evaluation({
      orgId: input.orgId,
      data: {
        authentication: input.authentication,
        approvals: input.approvals,
        request: input.request,
        feeds
      }
    })

    const status = getStatus(evaluation.decision)

    const authzRequest = await this.authzRequestRepository.update({
      id: input.id,
      orgId: input.orgId,
      status,
      evaluations: [
        {
          id: uuid(),
          decision: evaluation.decision,
          // TODO (@mattschoch, 23/01/24): return the full attestation?
          signature: evaluation?.attestation?.sig || null,
          createdAt: new Date()
        }
      ]
    })

    // TODO (@wcalderipe, 01/02/24): Move to the TransferTrackingService.
    if (authzRequest.request.action === Action.SIGN_TRANSACTION && status === AuthorizationRequestStatus.PERMITTED) {
      // TODO (@wcalderipe, 08/02/24): Remove the cast `as Intent`.
      const intent = evaluation.transactionRequestIntent as Intent
      if (intent && intent.type === Intents.TRANSFER_NATIVE) {
        const transferPrices = await this.priceService.getPrices({
          from: [intent.token],
          to: [FIAT_ID_USD]
        })

        const transfer = {
          orgId: authzRequest.orgId,
          requestId: authzRequest.id,
          from: intent.from,
          to: intent.to,
          token: intent.token,
          chainId: authzRequest.request.transactionRequest.chainId,
          initiatedBy: authzRequest.authentication.pubKey,
          createdAt: new Date(),
          amount: BigInt(intent.amount),
          rates: transferPrices[intent.token]
        }

        await this.transferTrackingService.track(transfer)
      }
    }

    this.logger.log('Authorization request status updated', {
      orgId: authzRequest.orgId,
      id: authzRequest.id,
      status: authzRequest.status,
      evaluations: authzRequest.evaluations
    })

    return authzRequest
  }
}
