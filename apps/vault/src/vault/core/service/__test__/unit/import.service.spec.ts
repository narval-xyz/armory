import {
  LoggerModule,
  MetricService,
  OTEL_ATTR_CLIENT_ID,
  OpenTelemetryModule,
  StatefulMetricService
} from '@narval/nestjs-shared'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { Origin, PrivateAccount } from '../../../../../shared/type/domain.type'
import { AccountRepository } from '../../../../persistence/repository/account.repository'
import { ImportRepository } from '../../../../persistence/repository/import.repository'
import { ImportService } from '../../import.service'
import { KeyGenerationService } from '../../key-generation.service'

describe('ImportService', () => {
  let importService: ImportService
  let accountRepository: AccountRepository
  let statefulMetricService: StatefulMetricService
  let importRepositoryMock: MockProxy<ImportRepository>

  const clientId = 'clientId'
  const privateKey = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'
  const accountId = 'accountId'

  beforeEach(async () => {
    importRepositoryMock = mock<ImportRepository>()

    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule.forTest(), OpenTelemetryModule.forTest()],
      providers: [
        ImportService,
        {
          provide: AccountRepository,
          useValue: {
            // mock the methods of AccountRepository that are used in ImportService
            // for example:
            save: jest.fn().mockResolvedValue({
              id: accountId,
              address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
              privateKey
            })
          }
        },
        {
          provide: ImportRepository,
          useValue: importRepositoryMock
        },
        {
          provide: KeyGenerationService,
          useValue: {}
        }
      ]
    }).compile()

    importService = module.get(ImportService)
    accountRepository = module.get(AccountRepository)
    statefulMetricService = module.get(MetricService)
  })

  describe('importPrivateKey', () => {
    it('imports private key and return an account', async () => {
      const account: PrivateAccount = await importService.importPrivateKey(clientId, privateKey, accountId)

      expect(account).toEqual({
        id: 'accountId',
        address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
        privateKey
      })
      expect(accountRepository.save).toHaveBeenCalledWith(clientId, {
        id: accountId,
        privateKey,
        origin: Origin.IMPORTED,
        publicKey:
          '0x04b314faec9379289567598cb2ef18453543a4e1bbaf3cbadb1251c18a7b85c2660b30bb20796c0e0f70cfe1aa86d73bf1e0b42045fbe6ea4c82bbe64b753a01de',
        address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
      })
    })

    it('increments account import counter metric', async () => {
      await importService.importPrivateKey(clientId, privateKey, accountId)

      expect(statefulMetricService.counters).toEqual([
        {
          name: 'account_import_count',
          value: 1,
          attributes: {
            [OTEL_ATTR_CLIENT_ID]: clientId
          }
        }
      ])
    })
  })
})
