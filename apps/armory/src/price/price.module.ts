import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { PriceService } from './core/service/price.service'
import { CoinGeckoClient } from './http/client/coin-gecko/coin-gecko.client'
import { CoinGeckoAssetRepository } from './persistence/repository/coin-gecko-asset.repository'

@Module({
  imports: [HttpModule],
  providers: [PriceService, CoinGeckoClient, CoinGeckoAssetRepository],
  exports: [PriceService]
})
export class PriceModule {}
