import {
  Approval,
  AuthorizationRequest,
  AuthorizationRequestStatus,
  CreateAuthorizationRequest
} from '@app/orchestration/policy-engine/core/type/domain.type'
import { AuthzApplicationClient } from '@app/orchestration/policy-engine/http/client/authz-application.client'
import { AuthorizationRequestRepository } from '@app/orchestration/policy-engine/persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingProducer } from '@app/orchestration/policy-engine/queue/producer/authorization-request-processing.producer'
import { ApplicationException } from '@app/orchestration/shared/exception/application.exception'
import { TransferFeedService } from '@app/orchestration/transfer-feed/core/service/transfer-feed.service'
import { Action } from '@narval/authz-shared'
import { HttpService } from '@nestjs/axios'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { catchError, lastValueFrom, map, tap } from 'rxjs'
import { SetOptional } from 'type-fest'
import { v4 as uuid } from 'uuid'
import { getOkTransfers } from './transfers.mock'

const getStatus = (decision: string): AuthorizationRequestStatus => {
  const statuses: Map<string, AuthorizationRequestStatus> = new Map([
    ['Permit', AuthorizationRequestStatus.PERMITTED],
    ['Forbid', AuthorizationRequestStatus.FORBIDDEN],
    ['Confirm', AuthorizationRequestStatus.APPROVING]
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
    private httpService: HttpService,
    private authzApplicationClient: AuthzApplicationClient,
    private transferFeedService: TransferFeedService
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

    const data = {
      authentication: input.authentication,
      approvals: input.approvals,
      request: input.request,
      // transfers: getNotOkTransfers()
      transfers: getOkTransfers()
    }

    // await this.authzApplicationClient.evaluation({
    //   baseUrl: 'http://localhost:3010',
    //   data
    // })

    this.logger.log('Sending authorization request to cluster evaluation', {
      authzRequest: input,
      payload: data
    })

    const evaluation = await lastValueFrom(
      this.httpService.post('http://localhost:3010/evaluation', data).pipe(
        tap((response) => {
          this.logger.log('Received evaluation response', {
            status: response.status,
            headers: response.headers,
            response: response.data
          })
        }),
        map((response) => response.data),
        catchError((error) => {
          throw new ApplicationException({
            message: 'Authorization request evaluation failed',
            suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            context: {
              sourceError: error
            }
          })
        })
      )
    )

    const status = getStatus(evaluation.decision)

    const authzRequest = await this.authzRequestRepository.update({
      ...input,
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
      if (intent.type === 'transferNative') {
        const transfer = {
          orgId: authzRequest.orgId,
          from: intent.from,
          to: intent.to,
          token: intent.token,
          chainId: authzRequest.request.transactionRequest.chainId,
          initiatedBy: authzRequest.authentication.pubKey,
          createdAt: new Date(),
          amount: BigInt(intent.amount),
          rates: {
            'fiat:usd': 0.99
          }
        }

        await this.transferFeedService.track(transfer)
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
