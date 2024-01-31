import { ApplicationException } from '@app/orchestration/shared/exception/application.exception'
import { EvaluationRequest, EvaluationResponse } from '@narval/authz-shared'
import { HttpService } from '@nestjs/axios'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { catchError, lastValueFrom, map, tap } from 'rxjs'

export type EvaluationRequest = EvaluationRequest
export type EvaluationResponse = EvaluationResponse

@Injectable()
export class AuthzApplicationClient {
  private logger = new Logger(AuthzApplicationClient.name)

  constructor(private httpService: HttpService) {}

  async evaluation(option: { host: string; data: EvaluationRequest }): Promise<EvaluationResponse> {
    this.logger.log('Sending evaluation request', option)

    return lastValueFrom(
      this.httpService.post(`${option.host}/evaluation`, option.data).pipe(
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
            message: 'Evaluation request failed',
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
