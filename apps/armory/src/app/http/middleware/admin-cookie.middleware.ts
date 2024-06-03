import { secret } from '@narval/nestjs-shared'
import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { AppService } from '../../core/service/app.service'

const COOKIE_KEY = 'armory:admin'

@Injectable()
export class AdminCookieMiddleware implements NestMiddleware {
  constructor(private appService: AppService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.query['adminApiKey'] || req.signedCookies[COOKIE_KEY]

    if (!apiKey || Array.isArray(apiKey) || typeof apiKey !== 'string') {
      return next(new ForbiddenException('Missing or invalid admin API key query parameter'))
    }

    const app = await this.appService.getAppOrThrow()

    if (app.adminApiKey === secret.hash(apiKey)) {
      const tenMinutes = 60 * 10 * 1000

      res.cookie(COOKIE_KEY, apiKey, {
        signed: true,
        sameSite: true,
        httpOnly: true,
        maxAge: tenMinutes
      })

      return next()
    }

    return next(new ForbiddenException('Invalid credentials'))
  }
}
