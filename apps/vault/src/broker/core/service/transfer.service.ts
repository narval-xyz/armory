import { LoggerService, TraceService } from '@narval/nestjs-shared'
import { HttpStatus, Inject, Injectable, NotImplementedException } from '@nestjs/common'
import { SpanStatusCode } from '@opentelemetry/api'
import { TransferRepository } from '../../persistence/repository/transfer.repository'
import { OTEL_ATTR_CONNECTION_PROVIDER } from '../../shared/constant'
import { BrokerException } from '../exception/broker.exception'
import { AnchorageTransferService } from '../provider/anchorage/anchorage-transfer.service'
import { ConnectionStatus, Provider, isActiveConnection } from '../type/connection.type'
import { ProviderTransferService } from '../type/provider.type'
import { InternalTransfer, SendTransfer } from '../type/transfer.type'
import { ConnectionService } from './connection.service'
import { TransferPartyService } from './transfer-party.service'

@Injectable()
export class TransferService {
  constructor(
    private readonly transferRepository: TransferRepository,
    private readonly connectionService: ConnectionService,
    private readonly transferPartyService: TransferPartyService,
    private readonly anchorageTransferService: AnchorageTransferService,
    private readonly logger: LoggerService,
    @Inject(TraceService) private readonly traceService: TraceService
  ) {}

  async findById(clientId: string, transferId: string): Promise<InternalTransfer> {
    return this.transferRepository.findById(clientId, transferId)
  }

  async bulkCreate(transfers: InternalTransfer[]): Promise<InternalTransfer[]> {
    return this.transferRepository.bulkCreate(transfers)
  }

  async send(clientId: string, sendTransfer: SendTransfer): Promise<InternalTransfer> {
    this.logger.log('Send transfer', { clientId, sendTransfer })

    const span = this.traceService.startSpan(`${TransferService.name}.sync`)

    const source = await this.transferPartyService.resolve(clientId, sendTransfer.source)
    const { data: connections } = await this.connectionService.findAll(
      clientId,
      {
        filters: {
          status: ConnectionStatus.ACTIVE
        }
      },
      true
    )

    if (connections.length && isActiveConnection(connections[0])) {
      const [connection] = connections

      span.setAttribute(OTEL_ATTR_CONNECTION_PROVIDER, connection.provider)

      const transfer = await this.getProviderTransferService(source.provider).send(connection, sendTransfer)

      span.end()

      return transfer
    }

    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: 'Cannot find an active connection for the source'
    })
    span.end()

    throw new BrokerException({
      message: 'Cannot find an active connection for the source',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { source }
    })
  }

  private getProviderTransferService(provider: Provider): ProviderTransferService {
    switch (provider) {
      case Provider.ANCHORAGE:
        return this.anchorageTransferService
      default:
        throw new NotImplementedException(`Unsupported transfer for provider ${provider}`)
    }
  }
}
