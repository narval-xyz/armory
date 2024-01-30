import { PriceService } from '@app/orchestration/price/core/service/price.service'
import { CoinGeckoClient } from '@app/orchestration/price/http/client/coin-gecko/coin-gecko.client'
import { CoinGeckoAssetRepository } from '@app/orchestration/price/persistence/repository/coin-gecko-asset.repository'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

@Module({
  imports: [HttpModule],
  providers: [PriceService, CoinGeckoClient, CoinGeckoAssetRepository],
  exports: [PriceService]
})
export class PriceModule {}
