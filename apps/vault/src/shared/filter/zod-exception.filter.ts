import { ConfigService } from '@narval/config-module'
import { LoggerService } from '@narval/nestjs-shared'
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { ZodValidationException } from 'nestjs-zod'
import { ZodError } from 'zod'
import { Config, Env } from '../../main.config'
import { HttpException } from '../type/http-exception.type'

// Catch both types, because the zodToDto function will throw a wrapped
// ZodValidationError that otherwise isn't picked up here.
@Catch(ZodError, ZodValidationException)
export class ZodExceptionFilter implements ExceptionFilter {
  constructor(
    private configService: ConfigService<Config>,
    private logger: LoggerService
  ) {}

  catch(exception: ZodError | ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = HttpStatus.UNPROCESSABLE_ENTITY
    const isProduction = this.configService.get('env') === Env.PRODUCTION

    const zodError = exception instanceof ZodValidationException ? exception.getZodError() : exception

    this.logger.error("Uncaught ZodError | IF YOU'RE READING THIS, HANDLE THE ERROR IN THE CALLER", {
      exception: zodError
    })

    const body: HttpException = isProduction
      ? {
          statusCode: status,
          message: 'Validation error',
          context: zodError.flatten()
        }
      : {
          statusCode: status,
          message: 'Validation error',
          context: zodError.flatten(),
          stack: zodError.stack
        }

    response.status(status).json(body)
  }
}
