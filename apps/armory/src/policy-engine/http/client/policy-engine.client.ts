import { CreateClient, EvaluationRequest, EvaluationResponse, PublicClient } from '@narval/policy-engine-shared'
import { HttpService } from '@nestjs/axios'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { catchError, lastValueFrom, map, tap } from 'rxjs'
import { ApplicationException } from '../../../shared/exception/application.exception'

export class PolicyEngineClientException extends ApplicationException {}

@Injectable()
export class PolicyEngineClient {
  private logger = new Logger(PolicyEngineClient.name)

  constructor(private httpService: HttpService) {}

  async evaluate(option: {
    host: string
    data: EvaluationRequest
    clientId?: string
    clientSecret?: string
  }): Promise<EvaluationResponse> {
    this.logger.log('Sending evaluation request', option)

    const headers = {
      'x-client-id': option.clientId,
      'x-client-secret': option.clientSecret
    }

    return lastValueFrom(
      this.httpService.post(`${option.host}/evaluations`, option.data, { headers }).pipe(
        tap((response) => {
          this.logger.log('Received evaluation response', {
            host: option.host,
            status: response.status,
            headers: response.headers,
            response: response.data
          })
        }),
        map((response) => EvaluationResponse.parse(response.data)),
        catchError((error) => {
          throw new PolicyEngineClientException({
            message: 'Evaluation request failed',
            suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            origin: error,
            context: option
          })
        })
      )
    )
  }

  async createClient(option: {
    host: string
    data: CreateClient
    clientId?: string
    clientSecret?: string
  }): Promise<PublicClient> {
    this.logger.log('Sending create client request', option)

    const headers = {
      'x-client-id': option.clientId,
      'x-client-secret': option.clientSecret
    }

    return lastValueFrom(
      this.httpService.post<PublicClient>(`${option.host}/clients`, option.data, { headers }).pipe(
        tap((response) => {
          this.logger.log('Received create client response', {
            host: option.host,
            status: response.status,
            headers: response.headers,
            response: response.data
          })
        }),
        map((response) => PublicClient.parse(response.data)),
        catchError((error) => {
          throw new PolicyEngineClientException({
            message: 'Create client request failed',
            suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            origin: error,
            context: option
          })
        })
      )
    )
  }
}
