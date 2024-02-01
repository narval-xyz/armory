import { FeedService } from '@app/orchestration/data-feed/core/service/feed.service'
import { HistoricalTransferFeedService } from '@app/orchestration/data-feed/core/service/historical-transfer-feed.service'
import { PriceFeedService } from '@app/orchestration/data-feed/core/service/price-feed.service'
import { PriceModule } from '@app/orchestration/price/price.module'
import { PersistenceModule } from '@app/orchestration/shared/module/persistence/persistence.module'
import { TransferTrackingModule } from '@app/orchestration/transfer-tracking/transfer-tracking.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [PersistenceModule, PriceModule, TransferTrackingModule],
  providers: [FeedService, HistoricalTransferFeedService, PriceFeedService],
  exports: [FeedService]
})
export class DataFeedModule {}
