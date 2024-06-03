import { secret } from '@narval/nestjs-shared'
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { AppService } from '../../core/service/app.service'

@Injectable()
export class RequireAdminApiKeyQueryMiddleware implements NestMiddleware {
  constructor(private appService: AppService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const apiKey = req.query['adminApiKey']

    if (!apiKey || Array.isArray(apiKey) || typeof apiKey !== 'string') {
      throw new ApplicationException({
        message: 'Missing or invalid admin API key query parameter',
        suggestedHttpStatusCode: HttpStatus.FORBIDDEN
      })
    }

    const app = await this.appService.getAppOrThrow()

    if (app.adminApiKey === secret.hash(apiKey)) {
      _res.cookie('foo', 'bar')
      return next()
    }

    throw new ApplicationException({
      message: 'Forbid',
      suggestedHttpStatusCode: HttpStatus.FORBIDDEN
    })
  }
}
