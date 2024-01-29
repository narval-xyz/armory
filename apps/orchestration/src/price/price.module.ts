import { CoinGeckoClient } from '@app/orchestration/price/http/client/coin-gecko/coin-gecko.client'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'

@Module({
  imports: [HttpModule],
  providers: [CoinGeckoClient],
  exports: [CoinGeckoClient]
})
export class PriceModule {}
