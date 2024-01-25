import { CreateTransfer, Transfer } from '@app/orchestration/transfer-feed/core/type/domain.type'
import { TransferFeedRepository } from '@app/orchestration/transfer-feed/persistence/repository/transfer-feed.repository'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class TransferFeedService {
  private logger = new Logger(TransferFeedService.name)

  constructor(private transferFeedRepository: TransferFeedRepository) {}

  track(transfer: CreateTransfer): Promise<Transfer> {
    this.logger.log('Tracking approved transfer', transfer)

    return this.transferFeedRepository.create(transfer)
  }

  findByOrgId(orgId: string): Promise<Transfer[]> {
    return this.transferFeedRepository.findByOrgId(orgId)
  }
}
