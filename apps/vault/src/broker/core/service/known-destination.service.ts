import { LoggerService, PaginatedResult, TraceService } from '@narval/nestjs-shared'
import { HttpStatus, Inject, Injectable, NotImplementedException } from '@nestjs/common'
import { SpanStatusCode } from '@opentelemetry/api'
import { OTEL_ATTR_CONNECTION_PROVIDER } from '../../shared/constant'
import { BrokerException } from '../exception/broker.exception'
import { AnchorageKnownDestinationService } from '../provider/anchorage/anchorage-known-destination.service'
import { FireblocksKnownDestinationService } from '../provider/fireblocks/fireblocks-known-destination.service'
import { isActiveConnection } from '../type/connection.type'
import { KnownDestination as KnownDestinationNext } from '../type/known-destination.type'
import {
  Provider,
  ProviderKnownDestinationPaginationOptions,
  ProviderKnownDestinationService
} from '../type/provider.type'
import { ConnectionScope } from '../type/scope.type'
import { ConnectionService } from './connection.service'

@Injectable()
export class KnownDestinationService {
  constructor(
    private readonly connectionService: ConnectionService,
    private readonly anchorageKnownDestinationService: AnchorageKnownDestinationService,
    private readonly fireblocksKnownDestinationService: FireblocksKnownDestinationService,
    private readonly logger: LoggerService,
    @Inject(TraceService) private readonly traceService: TraceService
  ) {}

  async findAll(
    { clientId, connectionId }: ConnectionScope,
    options?: ProviderKnownDestinationPaginationOptions
  ): Promise<PaginatedResult<KnownDestinationNext>> {
    this.logger.log('Find provider known destinations', { clientId, connectionId, options })

    return this.traceService.startActiveSpan(`${KnownDestinationService.name}.send`, async (span) => {
      const connection = await this.connectionService.findWithCredentialsById(clientId, connectionId)

      span.setAttribute(OTEL_ATTR_CONNECTION_PROVIDER, connection.provider)

      if (isActiveConnection(connection)) {
        return this.getProviderKnownDestinationService(connection.provider).findAll(connection, options)
      }

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'Cannot find an active connection for the source'
      })

      span.end()

      throw new BrokerException({
        message: 'Cannot find an active connection for the source',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { connectionId, clientId }
      })
    })
  }

  getProviderKnownDestinationService(provider: Provider): ProviderKnownDestinationService {
    switch (provider) {
      case Provider.ANCHORAGE:
        return this.anchorageKnownDestinationService
      case Provider.FIREBLOCKS:
        return this.fireblocksKnownDestinationService
      default:
        throw new NotImplementedException(`Unsupported known destination for provider ${provider}`)
    }
  }
}
