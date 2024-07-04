import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { CreateTransfer, Transfer } from '../../../shared/core/type/transfer-tracking.type'
import { TransferRepository } from '../../../transfer-tracking/persistence/repository/transfer.repository'

@Injectable()
export class TransferTrackingService {
  constructor(
    private transferFeedRepository: TransferRepository,
    private logger: LoggerService
  ) {}

  track(transfer: CreateTransfer): Promise<Transfer> {
    this.logger.log('Tracking approved transfer', transfer)

    return this.transferFeedRepository.create(transfer)
  }

  findByClientId(clientId: string): Promise<Transfer[]> {
    return this.transferFeedRepository.findByClientId(clientId)
  }
}
