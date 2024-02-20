import { Alg, Prices } from '@narval/authz-shared'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import {
  generateAuthorizationRequest,
  generateSignTransactionRequest,
  generateTransactionRequest
} from '../../../../../__test__/fixture/authorization-request.fixture'
import { load } from '../../../../../orchestration.config'
import { FIAT_ID_USD, POLYGON } from '../../../../../orchestration.constant'
import { AuthorizationRequest } from '../../../../../policy-engine/core/type/domain.type'
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
        sig: {
          alg: Alg.ES256K,
          pubKey:
            '0x04583c9cf37f209ca3afbdb43f83dfaed0e758b89545bfa8e297d3d727fc3ed9c6f16607bc859f2304704329bf19c843acce511d0639bbd8abb1fe70e7dd05f8f5',
          sig: expect.any(String)
        }
      })
    })

    it('calls price service', async () => {
      await service.getFeed(authzRequest)

      expect(priceServiceMock.getPrices).toHaveBeenCalledWith({
        from: [POLYGON.coin.id],
        to: [FIAT_ID_USD]
      })
    })
  })
})
