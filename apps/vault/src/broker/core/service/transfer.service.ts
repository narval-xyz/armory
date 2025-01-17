import { LoggerService, TraceService } from '@narval/nestjs-shared'
import { HttpStatus, Inject, Injectable, NotImplementedException } from '@nestjs/common'
import { SpanStatusCode } from '@opentelemetry/api'
import { TransferRepository } from '../../persistence/repository/transfer.repository'
import { OTEL_ATTR_CONNECTION_PROVIDER } from '../../shared/constant'
import { BrokerException } from '../exception/broker.exception'
import { AnchorageTransferService } from '../provider/anchorage/anchorage-transfer.service'
import { FireblocksTransferService } from '../provider/fireblocks/fireblocks-transfer.service'
import { isActiveConnection } from '../type/connection.type'
import { Provider, ProviderTransferService } from '../type/provider.type'
import { InternalTransfer, SendTransfer } from '../type/transfer.type'
import { ConnectionService } from './connection.service'

@Injectable()
export class TransferService {
  constructor(
    private readonly transferRepository: TransferRepository,
    private readonly connectionService: ConnectionService,
    private readonly anchorageTransferService: AnchorageTransferService,
    private readonly fireblocksTransferService: FireblocksTransferService,
    private readonly logger: LoggerService,
    @Inject(TraceService) private readonly traceService: TraceService
  ) {}

  async findById(clientId: string, connectionId: string, transferId: string): Promise<InternalTransfer> {
    const span = this.traceService.startSpan(`${TransferService.name}.findById`)

    const connection = await this.connectionService.findWithCredentialsById(clientId, connectionId)
    const transfer = await this.getProviderTransferService(connection.provider).findById(connection, transferId)

    span.end()

    return transfer
  }

  async bulkCreate(transfers: InternalTransfer[]): Promise<InternalTransfer[]> {
    return this.transferRepository.bulkCreate(transfers)
  }

  async send(clientId: string, connectionId: string, sendTransfer: SendTransfer): Promise<InternalTransfer> {
    this.logger.log('Send transfer', { clientId, sendTransfer })

    const span = this.traceService.startSpan(`${TransferService.name}.send`)

    const connection = await this.connectionService.findWithCredentialsById(clientId, connectionId)

    if (isActiveConnection(connection)) {
      span.setAttribute(OTEL_ATTR_CONNECTION_PROVIDER, connection.provider)

      if (await this.transferRepository.existsByIdempotenceId(clientId, sendTransfer.idempotenceId)) {
        throw new BrokerException({
          message: 'Transfer idempotence ID already used',
          suggestedHttpStatusCode: HttpStatus.CONFLICT,
          context: { idempotenceId: sendTransfer.idempotenceId }
        })
      }

      const transfer = await this.getProviderTransferService(connection.provider).send(connection, sendTransfer)

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
      context: { connection, connectionId, clientId }
    })
  }

  private getProviderTransferService(provider: Provider): ProviderTransferService {
    switch (provider) {
      case Provider.ANCHORAGE:
        return this.anchorageTransferService
      case Provider.FIREBLOCKS:
        return this.fireblocksTransferService
      default:
        throw new NotImplementedException(`Unsupported transfer for provider ${provider}`)
    }
  }
}
