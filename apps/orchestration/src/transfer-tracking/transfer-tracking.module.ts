import { Module } from '@nestjs/common'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { TransferTrackingService } from './core/service/transfer-tracking.service'
import { TransferRepository } from './persistence/repository/transfer.repository'

@Module({
  imports: [PersistenceModule],
  providers: [TransferRepository, TransferTrackingService],
  exports: [TransferTrackingService]
})
export class TransferTrackingModule {}
