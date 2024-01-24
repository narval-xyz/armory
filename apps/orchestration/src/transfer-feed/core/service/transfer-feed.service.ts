import { CreateTransfer, Transfer } from '@app/orchestration/transfer-feed/core/type/domain.type'
import { TransferFeedRepository } from '@app/orchestration/transfer-feed/persistence/repository/transfer-feed.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class TransferFeedService {
  constructor(private transferFeedRepository: TransferFeedRepository) {}

  track(transfer: CreateTransfer): Promise<Transfer> {
    return this.transferFeedRepository.create(transfer)
  }

  findByOrgId(orgId: string): Promise<Transfer[]> {
    return this.transferFeedRepository.findByOrgId(orgId)
  }
}
