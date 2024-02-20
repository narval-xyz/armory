import { ArgumentsHost, Catch, ExceptionFilter, LogLevel, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import { Config, Env } from '../../armory.config'
import { ApplicationException } from '../../shared/exception/application.exception'

@Catch(ApplicationException)
export class ApplicationExceptionFilter implements ExceptionFilter {
  private logger = new Logger(ApplicationExceptionFilter.name)

  constructor(private configService: ConfigService<Config, true>) {}

  catch(exception: ApplicationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()
    const isProduction = this.configService.get('env') === Env.PRODUCTION

    this.log(exception)

    response.status(status).json(
      isProduction
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
    )
  }

  // TODO (@wcalderipe, 16/01/24): Unit test the logging logic. For that, we
  // must inject the logger in the constructor via dependency injection.
  private log(exception: ApplicationException) {
    const level: LogLevel = exception.getStatus() >= 500 ? 'error' : 'warn'

    if (this.logger[level]) {
      this.logger[level](exception.message, {
        status: exception.getStatus(),
        context: exception.context,
        stacktrace: exception.stack,
        origin: exception.origin
      })
    }
  }
}
