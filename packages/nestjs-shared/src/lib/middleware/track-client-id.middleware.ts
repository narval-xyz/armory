import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { OTEL_ATTR_CLIENT_ID, REQUEST_HEADER_CLIENT_ID } from '../constant'
import { TraceService } from '../module/open-telemetry'

@Injectable()
export class TrackClientIdMiddleware implements NestMiddleware {
  constructor(@Inject(TraceService) private traceService: TraceService) {}

  use(request: Request, _response: Response, next: NextFunction): void {
    const clientId = request.headers[REQUEST_HEADER_CLIENT_ID]

    if (clientId) {
      this.traceService.setAttributesOnActiveSpan({
        [OTEL_ATTR_CLIENT_ID]: clientId
      })
    }

    next()
  }
}
