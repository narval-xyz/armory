import { Test, TestingModule } from '@nestjs/testing'
import { Origin, _OLD_PRIVATE_WALLET_ } from '../../../../../shared/type/domain.type'
import { ImportRepository } from '../../../../persistence/repository/import.repository'
import { WalletRepository } from '../../../../persistence/repository/_OLD_WALLET_.repository'
import { ImportService } from '../../import.service'
import { KeyGenerationService } from '../../key-generation.service'

describe('ImportService', () => {
  let importService: ImportService
  let _OLD_WALLET_Repository: WalletRepository

  const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
        {
          provide: WalletRepository,
          useValue: {
            // mock the methods of WalletRepository that are used in ImportService
            // for example:
            save: jest.fn().mockResolvedValue({
              id: '_OLD_WALLET_Id',
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
    _OLD_WALLET_Repository = module.get<WalletRepository>(WalletRepository)
  })

  describe('importPrivateKey', () => {
    it('should import private key and return a _OLD_WALLET_', async () => {
      const clientId = 'clientId'
      const privateKey = PRIVATE_KEY
      const _OLD_WALLET_Id = '_OLD_WALLET_Id'

      const _OLD_WALLET_: _OLD_PRIVATE_WALLET_ = await importService.importPrivateKey(clientId, privateKey, _OLD_WALLET_Id)

      expect(_OLD_WALLET_).toEqual({ id: '_OLD_WALLET_Id', address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1', privateKey })
      expect(_OLD_WALLET_Repository.save).toHaveBeenCalledWith(clientId, {
        id: _OLD_WALLET_Id,
        privateKey,
        origin: Origin.IMPORTED,
        publicKey:
          '0x04b314faec9379289567598cb2ef18453543a4e1bbaf3cbadb1251c18a7b85c2660b30bb20796c0e0f70cfe1aa86d73bf1e0b42045fbe6ea4c82bbe64b753a01de',
        address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
      })
    })
  })
})
