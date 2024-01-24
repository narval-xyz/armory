import { PersistenceModule } from '@app/orchestration/shared/module/persistence/persistence.module'
import { TransferFeedService } from '@app/orchestration/transfer-feed/core/service/transfer-feed.service'
import { TransferFeedRepository } from '@app/orchestration/transfer-feed/persistence/repository/transfer-feed.repository'
import { Module } from '@nestjs/common'

@Module({
  imports: [PersistenceModule],
  providers: [TransferFeedRepository, TransferFeedService],
  exports: [TransferFeedService]
})
export class TransferFeedModule {}
