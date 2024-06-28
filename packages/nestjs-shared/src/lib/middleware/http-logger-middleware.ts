import { Injectable, LoggerService, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl: path } = request
    response.on('close', () => {
      const { statusCode } = response

      this.logger.log(`${method} ${path.split('?')[0]} ${statusCode}`)
    })

    next()
  }
}
