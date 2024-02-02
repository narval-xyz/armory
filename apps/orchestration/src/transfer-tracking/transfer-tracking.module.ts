import { PersistenceModule } from '@app/orchestration/shared/module/persistence/persistence.module'
import { TransferTrackingService } from '@app/orchestration/transfer-tracking/core/service/transfer-tracking.service'
import { TransferRepository } from '@app/orchestration/transfer-tracking/persistence/repository/transfer.repository'
import { Module } from '@nestjs/common'

@Module({
  imports: [PersistenceModule],
  providers: [TransferRepository, TransferTrackingService],
  exports: [TransferTrackingService]
})
export class TransferTrackingModule {}
