import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { TraceService } from '../module/open-telemetry'

@Injectable()
export class TrackClientIdMiddleware implements NestMiddleware {
  constructor(@Inject(TraceService) private traceService: TraceService) {}

  use(request: Request, _response: Response, next: NextFunction): void {
    const clientId = request.headers['x-client-id']

    if (clientId) {
      this.traceService.setAttributesOnActiveSpan({
        'domain.client.id': clientId
      })
    }

    next()
  }
}
