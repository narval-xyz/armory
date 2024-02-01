import {
  generateAuthorizationRequest,
  generateSignTransactionRequest,
  generateTransactionRequest
} from '@app/orchestration/__test__/fixture/authorization-request.fixture'
import { generateTransferFeed } from '@app/orchestration/__test__/fixture/transfer-feed.fixture'
import { FeedService } from '@app/orchestration/data-feed/core/service/feed.service'
import { HistoricalTransferFeedService } from '@app/orchestration/data-feed/core/service/historical-transfer-feed.service'
import { PriceFeedService } from '@app/orchestration/data-feed/core/service/price-feed.service'
import { FIAT_ID_USD, POLYGON } from '@app/orchestration/orchestration.constant'
import { AuthorizationRequest } from '@app/orchestration/policy-engine/core/type/domain.type'
import { ChainId } from '@app/orchestration/shared/core/lib/chains.lib'
import { PrismaService } from '@app/orchestration/shared/module/persistence/service/prisma.service'
import { Alg, Feed, HistoricalTransfer, Prices } from '@narval/authz-shared'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock, mockDeep } from 'jest-mock-extended'
import { times } from 'lodash/fp'

describe(FeedService.name, () => {
  let module: TestingModule
  let service: FeedService
  let prismaServiceMock: MockProxy<PrismaService>
  let priceFeedServiceMock: MockProxy<PriceFeedService>
  let historicalTransferFeedServiceMock: MockProxy<HistoricalTransferFeedService>

  const authzRequest: AuthorizationRequest = generateAuthorizationRequest({
    request: generateSignTransactionRequest({
      transactionRequest: generateTransactionRequest({
        chainId: ChainId.POLYGON
      })
    })
  })

  const historicalTransferFeed: Feed<HistoricalTransfer[]> = {
    source: HistoricalTransferFeedService.SOURCE_ID,
    sig: {
      alg: Alg.ES256K,
      pubKey: 'test-pub-key',
      sig: 'test-signature'
    },
    data: HistoricalTransferFeedService.build(times(() => generateTransferFeed({ orgId: authzRequest.orgId }), 2))
  }

  const priceFeed: Feed<Prices> = {
    source: PriceFeedService.SOURCE_ID,
    sig: {
      alg: Alg.ES256K,
      pubKey: 'test-pub-key',
      sig: 'test-signature'
    },
    data: {
      [POLYGON.coin.id]: {
        [FIAT_ID_USD]: 0.99999
      }
    }
  }

  beforeEach(async () => {
    prismaServiceMock = mockDeep<PrismaService>()
    priceFeedServiceMock = mock<PriceFeedService>()
    historicalTransferFeedServiceMock = mock<HistoricalTransferFeedService>()

    priceFeedServiceMock.getFeed.mockResolvedValue(priceFeed)
    historicalTransferFeedServiceMock.getFeed.mockResolvedValue(historicalTransferFeed)

    module = await Test.createTestingModule({
      providers: [
        FeedService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock
        },
        {
          provide: PriceFeedService,
          useValue: priceFeedServiceMock
        },
        {
          provide: HistoricalTransferFeedService,
          useValue: historicalTransferFeedServiceMock
        }
      ]
    }).compile()

    service = module.get<FeedService>(FeedService)
  })

  describe('gather', () => {
    it('calls feed services with the authorization request', async () => {
      await service.gather(authzRequest)

      expect(priceFeedServiceMock.getFeed).toHaveBeenCalledWith(authzRequest)
      expect(historicalTransferFeedServiceMock.getFeed).toHaveBeenCalledWith(authzRequest)
    })

    it('saves the feeds', async () => {
      await service.gather(authzRequest)

      // Note: this assert doesn't offer much coverage. I'm using it just
      // because saving feeds today is just an idea not a requirement.
      expect(prismaServiceMock.feed.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            orgId: authzRequest.orgId,
            requestId: authzRequest.id,
            source: PriceFeedService.SOURCE_ID
          }),
          expect.objectContaining({
            orgId: authzRequest.orgId,
            requestId: authzRequest.id,
            source: HistoricalTransferFeedService.SOURCE_ID
          })
        ]
      })
    })
  })
})
