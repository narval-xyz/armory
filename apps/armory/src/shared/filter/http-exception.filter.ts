import { ConfigService } from '@narval/config-module'
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common'
import { Response } from 'express'
import { Config, Env } from '../../armory.config'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name)

  constructor(private configService: ConfigService<Config>) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()

    const isProduction = this.configService.get('env') === Env.PRODUCTION

    console.dir(exception, { depth: null })

    this.logger.error(exception)

    response.status(status).json(
      isProduction
        ? {
            statusCode: status,
            message: exception.message
          }
        : {
            statusCode: status,
            message: exception.message,
            stack: exception.stack
          }
    )
  }
}
