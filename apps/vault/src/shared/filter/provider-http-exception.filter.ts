import { ConfigService } from '@narval/config-module'
import { LoggerService } from '@narval/nestjs-shared'
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, LogLevel } from '@nestjs/common'
import { Response } from 'express'
import { ProviderHttpException } from '../../broker/core/exception/provider-http.exception'
import { Config, Env } from '../../main.config'
import { HttpException } from '../type/http-exception.type'

@Catch(ProviderHttpException)
export class ProviderHttpExceptionFilter implements ExceptionFilter {
  constructor(
    private configService: ConfigService<Config>,
    private logger: LoggerService
  ) {}

  catch(exception: ProviderHttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const isProduction = this.configService.get('env') === Env.PRODUCTION
    const status = exception.response.status

    this.log(exception)

    const body: HttpException = isProduction
      ? {
          statusCode: status,
          message: exception.message,
          context: this.buildContext(exception)
        }
      : {
          statusCode: status,
          message: exception.message,
          context: this.buildContext(exception),
          stack: exception.stack,
          ...(exception.origin && { origin: exception.origin })
        }

    response.status(status).json(body)
  }

  private buildContext(exception: ProviderHttpException) {
    return {
      provider: exception.provider,
      error: exception.response.body
    }
  }

  private log(exception: ProviderHttpException) {
    const level: LogLevel = exception.response.status >= HttpStatus.INTERNAL_SERVER_ERROR ? 'error' : 'warn'

    if (this.logger[level]) {
      this.logger[level]('Provider HTTP exception', {
        context: exception.context,
        errorMessage: exception.message,
        origin: exception.origin,
        provider: exception.provider,
        response: exception.response,
        stack: exception.stack
      })
    }
  }
}
