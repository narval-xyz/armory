import { PriceService } from '@app/orchestration/price/core/service/price.service'
import { CoinGeckoClient } from '@app/orchestration/price/http/client/coin-gecko/coin-gecko.client'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

@Module({
  imports: [HttpModule],
  providers: [CoinGeckoClient, PriceService],
  exports: [PriceService]
})
export class PriceModule {}
