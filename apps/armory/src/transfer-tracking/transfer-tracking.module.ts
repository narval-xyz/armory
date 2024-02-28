import { Module } from '@nestjs/common'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { TransferTrackingService } from './core/service/transfer-tracking.service'
import { TransferRepository } from './persistence/repository/transfer.repository'
import { TransferTrackingSeed } from './persistence/transfer-tracking.seed'

@Module({
  imports: [PersistenceModule],
  providers: [TransferRepository, TransferTrackingService, TransferTrackingSeed],
  exports: [TransferTrackingService]
})
export class TransferTrackingModule {}
