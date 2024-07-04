import { LoggerModule } from '@narval/nestjs-shared'
import { AssetType, getAddress, getAssetId, toAssetId } from '@narval/policy-engine-shared'
import { Test, TestingModule } from '@nestjs/testing'
import { mock } from 'jest-mock-extended'
import { ASSET_ID_MAINNET_USDC, ETHEREUM, FIAT_ID_USD, POLYGON } from '../../../../../armory.constant'
import { PriceException } from '../../../../core/exception/price.exception'
import { PriceService } from '../../../../core/service/price.service'
import { CoinGeckoClient } from '../../../../http/client/coin-gecko/coin-gecko.client'
import { CoinGeckoAssetRepository } from '../../../../persistence/repository/coin-gecko-asset.repository'

// TODO: (@samteb, 04/07/24) Disable prices for now because it adds dependency on coingecko
/* eslint-disable jest/no-disabled-tests */
xdescribe(PriceService.name, () => {
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
      imports: [LoggerModule.forTest()],
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

    it('throws PriceException when given asset id does not exist on coin gecko index', async () => {
      await expect(() =>
        service.getPrices({
          from: [getAssetId('eip155:00000/erc20:0x0000000000000000000000000000000000000000')],
          to: [FIAT_ID_USD]
        })
      ).rejects.toThrow(PriceException)
    })

    describe('when requesting for prices of the same address on differet chains', () => {
      const xDao = getAddress('0x71eeba415a523f5c952cc2f06361d5443545ad28')
      const xDaoMainnet = toAssetId({ chainId: 1, address: xDao, assetType: AssetType.ERC20 })
      const xDaoPolygon = toAssetId({ chainId: 137, address: xDao, assetType: AssetType.ERC20 })
      const xDaoDollarPrice = 0.6069648381377055

      it('responds with prices for both asset ids', async () => {
        jest.spyOn(coinGeckoClientMock, 'getSimplePrice').mockResolvedValue({
          xdao: { usd: xDaoDollarPrice }
        })

        const prices = await service.getPrices({
          from: [xDaoMainnet, xDaoPolygon],
          to: [FIAT_ID_USD]
        })

        expect(prices).toEqual({
          [xDaoMainnet]: {
            [FIAT_ID_USD]: xDaoDollarPrice
          },
          [xDaoPolygon]: {
            [FIAT_ID_USD]: xDaoDollarPrice
          }
        })
      })
    })
  })
})
