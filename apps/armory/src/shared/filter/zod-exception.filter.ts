import { ConfigService } from '@narval/config-module'
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common'
import { Response } from 'express'
import { ZodValidationException } from 'nestjs-zod'
import { ZodError } from 'zod'
import { Config, Env } from '../../armory.config'

@Catch(ZodError, ZodValidationException)
export class ZodExceptionFilter implements ExceptionFilter {
  private logger = new Logger(ZodExceptionFilter.name)

  constructor(private configService: ConfigService<Config>) {}

  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = HttpStatus.UNPROCESSABLE_ENTITY
    const isProduction = this.configService.get('env') === Env.PRODUCTION

    // Log as error level because Zod issues should be handled by the caller.
    this.logger.error('Uncaught ZodError', {
      exception
    })

    response.status(status).json(
      isProduction
        ? {
            statusCode: status,
            message: 'Internal validation error',
            context: exception.errors
          }
        : {
            statusCode: status,
            message: 'Internal validation error',
            context: exception.errors,
            stacktrace: exception.stack
          }
    )
  }
}
