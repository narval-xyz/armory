import { EvaluationRequest, EvaluationResponse } from '@narval/policy-engine-shared'
import { HttpService } from '@nestjs/axios'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { catchError, lastValueFrom, map, tap } from 'rxjs'
import { ApplicationException } from '../../../shared/exception/application.exception'

export class PolicyEngineClientException extends ApplicationException {}

@Injectable()
export class PolicyEngineClient {
  private logger = new Logger(PolicyEngineClient.name)

  constructor(private httpService: HttpService) {}

  async evaluation(option: {
    host: string
    data: EvaluationRequest
    headers?: Record<string, string>
  }): Promise<EvaluationResponse> {
    this.logger.log('Sending evaluation request', option)

    return lastValueFrom(
      this.httpService.post(`${option.host}/evaluations`, option.data, { headers: option.headers }).pipe(
        tap((response) => {
          this.logger.log('Received evaluation response', {
            host: option.host,
            status: response.status,
            headers: response.headers,
            response: response.data
          })
        }),
        map((response) => response.data),
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
}
