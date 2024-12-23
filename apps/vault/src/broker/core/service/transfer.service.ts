import { HttpStatus, Injectable, NotImplementedException } from '@nestjs/common'
import { TransferRepository } from '../../persistence/repository/transfer.repository'
import { BrokerException } from '../exception/broker.exception'
import { ConnectionStatus, Provider, isActiveConnection } from '../type/connection.type'
import { InternalTransfer, SendTransfer } from '../type/transfer.type'
import { AnchorageTransferService } from './anchorage-transfer.service'
import { ConnectionService } from './connection.service'
import { TransferPartyService } from './transfer-party.service'

@Injectable()
export class TransferService {
  constructor(
    private readonly transferRepository: TransferRepository,
    private readonly connectionService: ConnectionService,
    private readonly transferPartyService: TransferPartyService,
    private readonly anchorageTransferService: AnchorageTransferService
  ) {}

  async findById(clientId: string, transferId: string): Promise<InternalTransfer> {
    return this.transferRepository.findById(clientId, transferId)
  }

  async bulkCreate(transfers: InternalTransfer[]): Promise<InternalTransfer[]> {
    return this.transferRepository.bulkCreate(transfers)
  }

  async send(clientId: string, sendTransfer: SendTransfer): Promise<InternalTransfer> {
    const source = await this.transferPartyService.resolve(clientId, sendTransfer.source)

    if (source.provider === Provider.ANCHORAGE) {
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
        return this.anchorageTransferService.send(connections[0], sendTransfer)
      }

      throw new BrokerException({
        message: 'Cannot find an active connection for Anchorage',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }

    throw new NotImplementedException()
  }
}
