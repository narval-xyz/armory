import { Feed, HistoricalTransfer, Prices } from '@narval/policy-engine-shared'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock, mockDeep } from 'jest-mock-extended'
import {
  generateAuthorizationRequest,
  generateSignTransactionRequest,
  generateSignature,
  generateTransactionRequest
} from '../../../../../__test__/fixture/authorization-request.fixture'
import { generateHistoricalTransfers } from '../../../../../__test__/fixture/feed.fixture'
import { generatePrices } from '../../../../../__test__/fixture/price.fixture'
import { AuthorizationRequest } from '../../../../../orchestration/core/type/domain.type'
import { ChainId } from '../../../../../shared/core/lib/chains.lib'
import { PrismaService } from '../../../../../shared/module/persistence/service/prisma.service'
import { FeedService } from '../../feed.service'
import { HistoricalTransferFeedService } from '../../historical-transfer-feed.service'
import { PriceFeedService } from '../../price-feed.service'

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
    sig: generateSignature(),
    data: generateHistoricalTransfers()
  }

  const priceFeed: Feed<Prices> = {
    source: PriceFeedService.SOURCE_ID,
    sig: generateSignature(),
    data: generatePrices()
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
