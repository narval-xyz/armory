import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'
import { ZodValidationException } from 'nestjs-zod'
import { ZodError } from 'zod'
import { Config, Env } from '../../main.config'

// Catch both types, because the zodToDto function will throw a wrapped
// ZodValidationError that otherwise isn't picked up here.
@Catch(ZodError, ZodValidationException)
export class ZodExceptionFilter implements ExceptionFilter {
  private logger = new Logger(ZodExceptionFilter.name)

  constructor(private configService: ConfigService<Config, true>) {}

  catch(exception: ZodError | ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = HttpStatus.UNPROCESSABLE_ENTITY
    const isProduction = this.configService.get('env') === Env.PRODUCTION

    const zodError = exception instanceof ZodValidationException ? exception.getZodError() : exception

    // Log as error level because Zod issues should be handled by the caller.
    this.logger.error('Uncaught ZodError', {
      exception: zodError
    })

    response.status(status).json(
      isProduction
        ? {
            statusCode: status,
            message: 'Internal validation error',
            context: zodError.flatten()
          }
        : {
            statusCode: status,
            message: 'Internal validation error',
            context: zodError.flatten(),
            stacktrace: zodError.stack
          }
    )
  }
}
