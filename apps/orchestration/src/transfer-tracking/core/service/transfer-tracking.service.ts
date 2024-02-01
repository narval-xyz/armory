import { CreateTransfer, Transfer } from '@app/orchestration/shared/core/type/transfer-feed.type'
import { TransferRepository } from '@app/orchestration/transfer-tracking/persistence/repository/transfer.repository'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class TransferTrackingService {
  private logger = new Logger(TransferTrackingService.name)

  constructor(private transferFeedRepository: TransferRepository) {}

  track(transfer: CreateTransfer): Promise<Transfer> {
    this.logger.log('Tracking approved transfer', transfer)

    return this.transferFeedRepository.create(transfer)
  }

  findByOrgId(orgId: string): Promise<Transfer[]> {
    return this.transferFeedRepository.findByOrgId(orgId)
  }
}
