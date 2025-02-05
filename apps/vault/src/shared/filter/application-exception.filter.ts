import { ConfigService } from '@narval/config-module'
import { LoggerService } from '@narval/nestjs-shared'
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, LogLevel } from '@nestjs/common'
import { Response } from 'express'
import { Config, Env } from '../../main.config'
import { ApplicationException } from '../../shared/exception/application.exception'
import { HttpException } from '../type/http-exception.type'

@Catch(ApplicationException)
export class ApplicationExceptionFilter implements ExceptionFilter {
  constructor(
    private configService: ConfigService<Config>,
    private logger: LoggerService
  ) {}

  catch(exception: ApplicationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()
    const isProduction = this.configService.get('env') === Env.PRODUCTION

    this.log(exception)

    const body: HttpException = isProduction
      ? {
          statusCode: status,
          message: exception.message,
          context: exception.context
        }
      : {
          statusCode: status,
          message: exception.message,
          context: exception.context,
          stack: exception.stack,
          ...(exception.origin && { origin: exception.origin })
        }

    response.status(status).json(body)
  }

  private log(exception: ApplicationException) {
    const level: LogLevel = exception.getStatus() >= HttpStatus.INTERNAL_SERVER_ERROR ? 'error' : 'warn'

    if (this.logger[level]) {
      this.logger[level](exception.message, {
        status: exception.getStatus(),
        context: exception.context,
        stack: exception.stack,
        origin: exception.origin
      })
    }
  }
}
