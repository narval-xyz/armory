import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { PriceService } from './core/service/price.service'
import { CoinGeckoClient } from './http/client/coin-gecko/coin-gecko.client'
import { CoinGeckoAssetRepository } from './persistence/repository/coin-gecko-asset.repository'
import { LoggerModule } from '@narval/nestjs-shared'

@Module({
  imports: [HttpModule, LoggerModule],
  providers: [PriceService, CoinGeckoClient, CoinGeckoAssetRepository],
  exports: [PriceService]
})
export class PriceModule {}
