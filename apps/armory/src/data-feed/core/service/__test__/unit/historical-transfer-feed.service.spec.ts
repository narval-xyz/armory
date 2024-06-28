import { ConfigModule } from '@narval/config-module'
import { LoggerService, NullLoggerService } from '@narval/nestjs-shared'
import { AuthorizationRequest } from '@narval/policy-engine-shared'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { times } from 'lodash/fp'
import {
  generateAuthorizationRequest,
  generateSignTransactionRequest,
  generateTransactionRequest
} from '../../../../../__test__/fixture/authorization-request.fixture'
import { generateTransfer } from '../../../../../__test__/fixture/transfer-tracking.fixture'
import { load } from '../../../../../armory.config'
import { ChainId } from '../../../../../shared/core/lib/chains.lib'
import { Transfer } from '../../../../../shared/core/type/transfer-tracking.type'
import { TransferTrackingService } from '../../../../../transfer-tracking/core/service/transfer-tracking.service'
import { HistoricalTransferFeedService } from '../../../../core/service/historical-transfer-feed.service'

describe(HistoricalTransferFeedService.name, () => {
  let module: TestingModule
  let service: HistoricalTransferFeedService
  let transferTrackingServiceMock: MockProxy<TransferTrackingService>

  const authzRequest: AuthorizationRequest = generateAuthorizationRequest({
    request: generateSignTransactionRequest({
      transactionRequest: generateTransactionRequest({
        chainId: ChainId.POLYGON
      })
    })
  })

  const transfers: Transfer[] = times(() => generateTransfer({ clientId: authzRequest.clientId }), 2)

  beforeEach(async () => {
    transferTrackingServiceMock = mock<TransferTrackingService>()
    transferTrackingServiceMock.findByClientId.mockResolvedValue(transfers)

    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [load] })],
      providers: [
        HistoricalTransferFeedService,
        {
          provide: TransferTrackingService,
          useValue: transferTrackingServiceMock
        },
        {
          provide: LoggerService,
          useClass: NullLoggerService
        }
      ]
    }).compile()

    service = module.get<HistoricalTransferFeedService>(HistoricalTransferFeedService)
  })

  describe('getId', () => {
    it('returns the unique feed id', () => {
      expect(service.getId()).toEqual(HistoricalTransferFeedService.SOURCE_ID)
    })
  })

  describe('getPubKey', () => {
    it('returns the derived public key', () => {
      expect(service.getPubKey()).toEqual(
        '0x041a2a9746efacc23443530a75092ad75c6cd5dd10d2ccc1d9c866acf9545974bcacc6b755c3c241d6a35b9b27b00cd2df8f46525a751d6872360c3be3015bb563'
      )
    })
  })

  describe('getFeed', () => {
    it('gets signed historical transfers feed', async () => {
      const feed = await service.getFeed(authzRequest)

      expect(feed).toMatchObject({
        data: HistoricalTransferFeedService.build(transfers),
        source: HistoricalTransferFeedService.SOURCE_ID,
        sig: expect.any(String)
      })
    })

    it('calls transfer tracking service', async () => {
      await service.getFeed(authzRequest)

      expect(transferTrackingServiceMock.findByClientId).toHaveBeenCalledWith(authzRequest.clientId)
    })
  })
})
