import { Injectable, Logger } from '@nestjs/common'
import { CreateTransfer, Transfer } from '../../../shared/core/type/transfer-tracking.type'
import { TransferRepository } from '../../../transfer-tracking/persistence/repository/transfer.repository'

@Injectable()
export class TransferTrackingService {
  private logger = new Logger(TransferTrackingService.name)

  constructor(private transferFeedRepository: TransferRepository) {}

  track(transfer: CreateTransfer): Promise<Transfer> {
    this.logger.log('Tracking approved transfer', transfer)

    return this.transferFeedRepository.create(transfer)
  }

  findByClientId(clientId: string): Promise<Transfer[]> {
    return this.transferFeedRepository.findByClientId(clientId)
  }
}
