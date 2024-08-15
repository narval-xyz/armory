import { ConfigModule } from '@narval/config-module'
import { LoggerService, NullLoggerService } from '@narval/nestjs-shared'
import { AuthorizationRequest, Prices } from '@narval/policy-engine-shared'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import {
  generateAuthorizationRequest,
  generateSignTransactionRequest,
  generateTransactionRequest
} from '../../../../../__test__/fixture/authorization-request.fixture'
import { load } from '../../../../../armory.config'
import { FIAT_ID_USD, POLYGON } from '../../../../../armory.constant'
import { PriceService } from '../../../../../price/core/service/price.service'
import { ChainId } from '../../../../../shared/core/lib/chains.lib'
import { PriceFeedService } from '../../../../core/service/price-feed.service'

describe(PriceFeedService.name, () => {
  let module: TestingModule
  let service: PriceFeedService
  let priceServiceMock: MockProxy<PriceService>

  const prices: Prices = {
    [POLYGON.coin.id]: {
      [FIAT_ID_USD]: 0.99
    }
  }

  beforeEach(async () => {
    priceServiceMock = mock<PriceService>()
    priceServiceMock.getPrices.mockResolvedValue(prices)

    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [load] })],
      providers: [
        PriceFeedService,
        {
          provide: PriceService,
          useValue: priceServiceMock
        },
        {
          provide: LoggerService,
          useClass: NullLoggerService
        }
      ]
    }).compile()

    service = module.get<PriceFeedService>(PriceFeedService)
  })

  describe('getId', () => {
    it('returns the unique feed id', () => {
      expect(service.getId()).toEqual(PriceFeedService.SOURCE_ID)
    })
  })

  describe('getPubKey', () => {
    it('returns the derived public key', () => {
      expect(service.getPubKey()).toEqual(
        '0x04583c9cf37f209ca3afbdb43f83dfaed0e758b89545bfa8e297d3d727fc3ed9c6f16607bc859f2304704329bf19c843acce511d0639bbd8abb1fe70e7dd05f8f5'
      )
    })
  })

  describe('getFeed', () => {
    const authzRequest: AuthorizationRequest = generateAuthorizationRequest({
      request: generateSignTransactionRequest({
        transactionRequest: generateTransactionRequest({
          chainId: ChainId.POLYGON
        })
      })
    })

    it('gets signed price feed', async () => {
      const feed = await service.getFeed(authzRequest)

      expect(feed).toMatchObject({
        data: prices,
        source: PriceFeedService.SOURCE_ID,
        sig: expect.any(String)
      })
    })

    // 15-08-2024 @mattschoch - skipping because price feed is currently disabled
    // it('calls price service', async () => {
    //   await service.getFeed(authzRequest)

    //   expect(priceServiceMock.getPrices).toHaveBeenCalledWith({
    //     from: [POLYGON.coin.id],
    //     to: [FIAT_ID_USD]
    //   })
    // })
  })
})
