import { Test, TestingModule } from '@nestjs/testing'
import { Origin, PrivateAccount } from '../../../../../shared/type/domain.type'
import { AccountRepository } from '../../../../persistence/repository/account.repository'
import { ImportRepository } from '../../../../persistence/repository/import.repository'
import { ImportService } from '../../import.service'
import { KeyGenerationService } from '../../key-generation.service'

describe('ImportService', () => {
  let importService: ImportService
  let accountRepository: AccountRepository

  const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
        {
          provide: AccountRepository,
          useValue: {
            // mock the methods of AccountRepository that are used in ImportService
            // for example:
            save: jest.fn().mockResolvedValue({
              id: 'accountId',
              address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
              privateKey: PRIVATE_KEY
            })
          }
        },
        {
          provide: ImportRepository,
          useValue: {}
        },
        {
          provide: KeyGenerationService,
          useValue: {}
        }
      ]
    }).compile()

    importService = module.get<ImportService>(ImportService)
    accountRepository = module.get<AccountRepository>(AccountRepository)
  })

  describe('importPrivateKey', () => {
    it('should import private key and return a account', async () => {
      const clientId = 'clientId'
      const privateKey = PRIVATE_KEY
      const accountId = 'accountId'

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
  })
})
