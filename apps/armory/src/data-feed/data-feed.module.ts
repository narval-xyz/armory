import { Module } from '@nestjs/common'
import { PriceModule } from '../price/price.module'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { TransferTrackingModule } from '../transfer-tracking/transfer-tracking.module'
import { HistoricalTransferFeedService } from './/core/service/historical-transfer-feed.service'
import { FeedService } from './core/service/feed.service'
import { PriceFeedService } from './core/service/price-feed.service'
import { LoggerModule } from '@narval/nestjs-shared'

@Module({
  imports: [PersistenceModule, PriceModule, TransferTrackingModule, LoggerModule],
  providers: [FeedService, HistoricalTransferFeedService, PriceFeedService],
  exports: [FeedService]
})
export class DataFeedModule {}
