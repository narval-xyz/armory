import { ConfigService } from '@narval/config-module'
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common'
import { Response } from 'express'
import { Config, Env } from '../../policy-engine.config'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name)

  constructor(private configService: ConfigService<Config>) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()

    const isProduction = this.configService.get('env') === Env.PRODUCTION

    this.logger.error({
      message: exception.message,
      stack: exception.stack,
      response: exception.getResponse(),
      statusCode: status
    })

    response.status(status).json(
      isProduction
        ? {
            statusCode: status,
            message: exception.message,
            response: exception.getResponse()
          }
        : {
            statusCode: status,
            message: exception.message,
            response: exception.getResponse(),
            stack: exception.stack
          }
    )
  }
}
