import { Test, TestingModule } from '@nestjs/testing'
import { Wallet } from '../../../../../shared/type/domain.type'
import { ImportRepository } from '../../../../persistence/repository/import.repository'
import { WalletRepository } from '../../../../persistence/repository/wallet.repository'
import { ImportService } from '../../import.service'

describe('ImportService', () => {
  let importService: ImportService
  let walletRepository: WalletRepository

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
              id: 'walletId',
              address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
              privateKey: PRIVATE_KEY
            })
          }
        },
        {
          provide: ImportRepository,
          useValue: {}
        }
      ]
    }).compile()

    importService = module.get<ImportService>(ImportService)
    walletRepository = module.get<WalletRepository>(WalletRepository)
  })

  describe('importPrivateKey', () => {
    it('should import private key and return a wallet', async () => {
      const tenantId = 'tenantId'
      const privateKey = PRIVATE_KEY
      const walletId = 'walletId'

      const wallet: Wallet = await importService.importPrivateKey(tenantId, privateKey, walletId)

      expect(wallet).toEqual({ id: 'walletId', address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1', privateKey })
      expect(walletRepository.save).toHaveBeenCalledWith(tenantId, {
        id: walletId,
        privateKey,
        address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
      })
    })
  })

  describe('generateWalletId', () => {
    it('should generate a wallet ID based on the address, lowercased', () => {
      const address = '0x2c4895215973CbBd778C32c456C074b99daF8Bf1'

      const walletId: string = importService.generateWalletId(address)

      expect(walletId).toEqual('eip155:eoa:0x2c4895215973cbbd778c32c456c074b99daf8bf1')
    })
  })
})
