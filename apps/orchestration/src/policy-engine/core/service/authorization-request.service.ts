import {
  AuthorizationRequest,
  AuthorizationRequestStatus,
  CreateAuthorizationRequest
} from '@app/orchestration/policy-engine/core/type/domain.type'
import { AuthorizationRequestRepository } from '@app/orchestration/policy-engine/persistence/repository/authorization-request.repository'
import { AuthorizationRequestProcessingProducer } from '@app/orchestration/policy-engine/queue/producer/authorization-request-processing.producer'
import { ApplicationException } from '@app/orchestration/shared/exception/application.exception'
import { HttpService } from '@nestjs/axios'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { catchError, lastValueFrom, map, switchMap, tap } from 'rxjs'
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
    // TODO (@wcalderipe, 19/01/24): Think how to error the evaluation but
    // short-circuit the retry mechanism.

    const payload = {
      authentication: input.authentication,
      approvals: input.approvals,
      request: {
        action: input.action,
        transactionRequest: input.request,
        resourceId: 'eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b'
      }
    }

    // const payload = {
    //   authentication: {
    //     sig: '0x9577787fc3a6db9d5779d0ec49222a24df0231659690eab80f21ea98161a55265de1b37c1a2534b46050feb0630dba7916f88b8203aa0b452200c52516495e651b',
    //     alg: 'ES256K',
    //     pubKey: '0xd75D626a116D4a1959fE3bB938B2e7c116A05890'
    //   },
    //   request: {
    //     action: 'signTransaction',
    //     transactionRequest: {
    //       from: '0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b',
    //       to: '0x031d8C0cA142921c459bCB28104c0FF37928F9eD',
    //       chainId: 137,
    //       data: '0xa9059cbb000000000000000000000000031d8c0ca142921c459bcb28104c0ff37928f9ed000000000000000000000000000000000000000000005ab7f55035d1e7b4fe6d',
    //       nonce: 192,
    //       type: '2'
    //     },
    //     resourceId: 'eip155:eoa:0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b'
    //   },
    //   approvals: [
    //     {
    //       sig: '0x3a07b4efd8f1af93ce046abf03bc50d107b67a2296ec36ae39bb52d49d9c43ee0ed62b406409995e4f659454180857353515526d21bf57881eaac4f05ff41ba61b',
    //       alg: 'ES256K',
    //       pubKey: '0x501D5c2Ce1EF208aadf9131a98BAa593258CfA06'
    //     },
    //     {
    //       sig: '0xdc9ccfa081fed5ca9878dfba4aa0b7e621b94d25b8de1f13469f925e17d55ea370a04477778f58edd8766dce024f05133c9a69e86a316f16d426a45b3d9a98531b',
    //       alg: 'ES256K',
    //       pubKey: '0xab88c8785D0C00082dE75D801Fcb1d5066a6311e'
    //     }
    //   ]
    // }

    this.logger.log('Sending authorization request to cluster evaluation', {
      authzRequest: input,
      payload
    })

    return lastValueFrom(
      this.httpService.post('http://localhost:3010/evaluation', payload).pipe(
        // delay(3000), // fake some delay
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
                signature: null,
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
