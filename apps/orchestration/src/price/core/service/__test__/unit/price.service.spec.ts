import { ASSET_ID_MAINNET_USDC, FIAT_ID_USD } from '@app/orchestration/orchestration.constant'
import { PriceException } from '@app/orchestration/price/core/exception/price.exception'
import { PriceService } from '@app/orchestration/price/core/service/price.service'
import { CoinGeckoClient } from '@app/orchestration/price/http/client/coin-gecko/coin-gecko.client'
import { CoinGeckoAssetRepository } from '@app/orchestration/price/persistence/repository/coin-gecko-asset.repository'
import { ETHEREUM, POLYGON } from '@app/orchestration/shared/core/lib/chains.lib'
import { getAssetId } from '@narval/authz-shared'
import { Test, TestingModule } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'

describe(PriceService.name, () => {
  let module: TestingModule
  let service: PriceService
  let coinGeckoClientMock: CoinGeckoClient

  const SIMPLE_PRICE = {
    ethereum: {
      usd: 2313.8968819430966
    },
    'matic-network': {
      usd: 0.8123732992684908
    },
    'usd-coin': {
      usd: 1.000709110429112
    }
  }

  beforeEach(async () => {
    coinGeckoClientMock = mock<CoinGeckoClient>()

    jest.spyOn(coinGeckoClientMock, 'getSimplePrice').mockResolvedValue(SIMPLE_PRICE)

    module = await Test.createTestingModule({
      providers: [
        PriceService,
        CoinGeckoAssetRepository,
        {
          provide: CoinGeckoClient,
          useValue: coinGeckoClientMock
        }
      ]
    }).compile()

    service = module.get<PriceService>(PriceService)
  })

  describe('getPrices', () => {
    it('converts asset id to coingecko id', async () => {
      await service.getPrices({
        from: [ETHEREUM.coin.id, POLYGON.coin.id, ASSET_ID_MAINNET_USDC],
        to: [FIAT_ID_USD]
      })

      expect(coinGeckoClientMock.getSimplePrice).toHaveBeenCalledWith({
        data: {
          ids: ['ethereum', 'matic-network', 'usd-coin'],
          vs_currencies: ['usd'],
          precision: 18
        }
      })
    })

    it('responds with prices', async () => {
      const prices = await service.getPrices({
        from: [ETHEREUM.coin.id, POLYGON.coin.id, ASSET_ID_MAINNET_USDC],
        to: [FIAT_ID_USD]
      })

      expect(prices).toEqual({
        [ETHEREUM.coin.id]: {
          [FIAT_ID_USD]: SIMPLE_PRICE.ethereum.usd
        },
        [POLYGON.coin.id]: {
          [FIAT_ID_USD]: SIMPLE_PRICE['matic-network'].usd
        },
        [ASSET_ID_MAINNET_USDC]: {
          [FIAT_ID_USD]: SIMPLE_PRICE['usd-coin'].usd
        }
      })
    })

    it('throws PriceException when given asset id does not exist on coin gecko index', () => {
      expect(() =>
        service.getPrices({
          from: [getAssetId('eip155:00000/erc20:0x0000000000000000000000000000000000000000')],
          to: [FIAT_ID_USD]
        })
      ).rejects.toThrow(PriceException)
    })
  })
})
