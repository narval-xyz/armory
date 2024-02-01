import { FIAT_ID_USD } from '@app/orchestration/orchestration.constant'
import {
  Approval,
  AuthorizationRequest,
  AuthorizationRequestStatus,
  CreateAuthorizationRequest
} from '@app/orchestration/policy-engine/core/type/domain.type'
import { AuthzApplicationClient } from '@app/orchestration/policy-engine/http/client/authz-application.client'
import { AuthorizationRequestRepository } from '@app/orchestration/policy-engine/persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingProducer } from '@app/orchestration/policy-engine/queue/producer/authorization-request-processing.producer'
import { PriceService } from '@app/orchestration/price/core/service/price.service'
import { getChain } from '@app/orchestration/shared/core/lib/chains.lib'
import { Transfer } from '@app/orchestration/shared/core/type/transfer-feed.type'
import { TransferTrackingService } from '@app/orchestration/transfer-tracking/core/service/transfer-tracking.service'
import { Action, AssetId, Decision, HistoricalTransfer } from '@narval/authz-shared'
import { Decoder, InputType, Intents } from '@narval/transaction-request-intent'
import { Injectable, Logger } from '@nestjs/common'
import { mapValues, omit, uniq } from 'lodash/fp'
import { SetOptional } from 'type-fest'
import { v4 as uuid } from 'uuid'

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
    private authzApplicationClient: AuthzApplicationClient,
    private transferTrackingService: TransferTrackingService,
    private priceService: PriceService
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
    // TODO (@wcalderipe, 19/01/24): Think how to error the evaluation but
    // short-circuit the retry mechanism.

    const [requestTransfers, requestPrices] = await Promise.all([
      this.transferTrackingService.findByOrgId(input.orgId),
      this.priceService.getPrices({
        from: this.getAssetIds(input),
        to: [FIAT_ID_USD]
      })
    ])

    const evaluation = await this.authzApplicationClient.evaluation({
      host: 'http://localhost:3010',
      data: {
        authentication: input.authentication,
        approvals: input.approvals,
        request: input.request,
        transfers: this.toHistoricalTransfers(requestTransfers),
        prices: requestPrices
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

    if (authzRequest.request.action === Action.SIGN_TRANSACTION && status === AuthorizationRequestStatus.PERMITTED) {
      const intent = evaluation.transactionRequestIntent
      if (intent && intent.type === Intents.TRANSFER_NATIVE) {
        const transferPrices = await this.priceService.getPrices({
          from: [intent.token],
          to: [FIAT_ID_USD]
        })

        const transfer = {
          orgId: authzRequest.orgId,
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

  private toHistoricalTransfers(transfers: Transfer[]): HistoricalTransfer[] {
    return transfers.map((transfer) => ({
      ...omit('orgId', transfer),
      amount: transfer.amount.toString(),
      timestamp: transfer.createdAt.getTime(),
      rates: mapValues((value) => value.toString(), transfer.rates)
    }))
  }

  private getAssetIds(authzRequest: AuthorizationRequest): AssetId[] {
    if (authzRequest.request.action === Action.SIGN_TRANSACTION) {
      const result = new Decoder().safeDecode({
        type: InputType.TRANSACTION_REQUEST,
        txRequest: authzRequest.request.transactionRequest
      })

      const chain = getChain(authzRequest.request.transactionRequest.chainId)

      if (result.success) {
        const { intent } = result

        if (intent.type === Intents.TRANSFER_NATIVE) {
          return uniq([chain.coin.id, intent.token])
        }
      }

      return [chain.coin.id]
    }

    return []
  }
}
