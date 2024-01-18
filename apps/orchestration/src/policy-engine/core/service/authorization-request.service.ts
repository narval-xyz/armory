import {
  AuthorizationRequest,
  AuthorizationRequestStatus,
  CreateAuthorizationRequest
} from '@app/orchestration/policy-engine/core/type/domain.type'
import { AuthorizationRequestRepository } from '@app/orchestration/policy-engine/http/persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingProducer } from '@app/orchestration/policy-engine/queue/producer/authorization-request-processing.producer'
import { ApplicationException } from '@app/orchestration/shared/exception/application.exception'
import { HttpService } from '@nestjs/axios'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { catchError, delay, lastValueFrom, map, switchMap, tap } from 'rxjs'
import { v4 as uuid } from 'uuid'

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
    private httpService: HttpService
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async complete(id: string) {}

  async evaluate(input: AuthorizationRequest): Promise<AuthorizationRequest> {
    this.logger.log('Sending authorization request to cluster evaluation', {
      input
    })

    return lastValueFrom(
      this.httpService.post('http://localhost:3010/evaluation', input).pipe(
        delay(3000), // fake some delay
        tap((response) => {
          this.logger.log('Received evaluation response', {
            status: response.status,
            headers: response.headers,
            response: response.data
          })
        }),
        map((response) => response.data),
        switchMap((evaluation) => {
          return this.authzRequestRepository.update({
            ...input,
            status: getStatus(evaluation.decision),
            evaluations: [
              {
                id: uuid(),
                decision: evaluation.decision,
                signature: evaluation.permitSignature,
                createdAt: new Date()
              }
            ]
          })
        }),
        tap((authzRequest) => {
          this.logger.log('Authorization request status updated', {
            orgId: authzRequest.orgId,
            id: authzRequest.id,
            status: authzRequest.status,
            evaluations: authzRequest.evaluations
          })
        }),
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
  }
}
