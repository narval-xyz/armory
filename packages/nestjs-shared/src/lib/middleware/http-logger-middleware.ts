import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { LoggerService } from '../module/logger/service/logger.service'

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private logger: LoggerService) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl: path } = request
    response.on('close', () => {
      const { statusCode } = response

      this.logger.log(`${method} ${path.split('?')[0]} ${statusCode}`)
    })

    next()
  }
}
