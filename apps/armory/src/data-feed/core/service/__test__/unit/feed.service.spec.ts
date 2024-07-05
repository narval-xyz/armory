import { LoggerService, NullLoggerService } from '@narval/nestjs-shared'
import { AuthorizationRequest, Feed, HistoricalTransfer, Prices } from '@narval/policy-engine-shared'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock, mockDeep } from 'jest-mock-extended'
import {
  generateAuthorizationRequest,
  generateSignTransactionRequest,
  generateTransactionRequest
} from '../../../../../__test__/fixture/authorization-request.fixture'
import { generateHistoricalTransfers } from '../../../../../__test__/fixture/feed.fixture'
import { generatePrices } from '../../../../../__test__/fixture/price.fixture'
import { ChainId } from '../../../../../shared/core/lib/chains.lib'
import { PrismaService } from '../../../../../shared/module/persistence/service/prisma.service'
import { FeedService } from '../../feed.service'
import { HistoricalTransferFeedService } from '../../historical-transfer-feed.service'
import { PriceFeedService } from '../../price-feed.service'

describe(FeedService.name, () => {
  const jwt =
    'eyJraWQiOiIweDJjNDg5NTIxNTk3M0NiQmQ3NzhDMzJjNDU2QzA3NGI5OWRhRjhCZjEiLCJhbGciOiJFSVAxOTEiLCJ0eXAiOiJKV1QifQ.eyJyZXF1ZXN0SGFzaCI6IjYwOGFiZTkwOGNmZmVhYjFmYzMzZWRkZTZiNDQ1ODZmOWRhY2JjOWM2ZmU2ZjBhMTNmYTMwNzIzNzI5MGNlNWEiLCJzdWIiOiJ0ZXN0LXJvb3QtdXNlci11aWQiLCJpc3MiOiJodHRwczovL2FybW9yeS5uYXJ2YWwueHl6IiwiY25mIjp7Imt0eSI6IkVDIiwiY3J2Ijoic2VjcDI1NmsxIiwiYWxnIjoiRVMyNTZLIiwidXNlIjoic2lnIiwia2lkIjoiMHgwMDBjMGQxOTEzMDhBMzM2MzU2QkVlMzgxM0NDMTdGNjg2ODk3MkM0IiwieCI6IjA0YTlmM2JjZjY1MDUwNTk1OTdmNmYyN2FkOGMwZjAzYTNiZDdhMTc2MzUyMGIwYmZlYzIwNDQ4OGI4ZTU4NDAiLCJ5IjoiN2VlOTI4NDVhYjFjMzVhNzg0YjA1ZmRmYTU2NzcxNWM1M2JiMmYyOTk0OWIyNzcxNGUzYzE3NjBlMzcwOTAwOWE2In19.gFDywYsxY2-uT6H6hyxk51CtJhAZpI8WtcvoXHltiWsoBVOot1zMo3nHAhkWlYRmD3RuLtmOYzi6TwTUM8mFyBs'

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
    sig: jwt,
    data: generateHistoricalTransfers()
  }

  const priceFeed: Feed<Prices> = {
    source: PriceFeedService.SOURCE_ID,
    sig: jwt,
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
        },
        {
          provide: LoggerService,
          useClass: NullLoggerService
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
            clientId: authzRequest.clientId,
            requestId: authzRequest.id,
            source: PriceFeedService.SOURCE_ID
          }),
          expect.objectContaining({
            clientId: authzRequest.clientId,
            requestId: authzRequest.id,
            source: HistoricalTransferFeedService.SOURCE_ID
          })
        ]
      })
    })
  })
})
