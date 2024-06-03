import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { QUEUE_MODULE_OPTION_TOKEN, QueueModuleOption } from './queue.module-definition'

@Injectable()
export class DashboardAuthProxyMiddleware implements NestMiddleware {
  private upstream?: NestMiddleware

  constructor(@Inject(QUEUE_MODULE_OPTION_TOKEN) option: QueueModuleOption) {
    this.upstream = option.dashboard?.auth
  }

  async use(req: Request, res: Response, next: NextFunction) {
    if (this.upstream) {
      this.upstream.use(req, res, next)
    }
  }
}
