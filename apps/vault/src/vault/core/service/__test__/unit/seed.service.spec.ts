import { publicKeyToHex, secp256k1PrivateKeyToPublicJwk } from '@narval/signature'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { Origin } from '../../../../../shared/type/domain.type'
import { ImportRepository } from '../../../../persistence/repository/import.repository'
import { SeedRepository } from '../../../../persistence/repository/mnemonic.repository'
import { BackupService } from '../../backup.service'
import { SeedService } from '../../seed.service'
import { WalletService } from '../../wallet.service'

const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

describe('SeedService', () => {
  let walletServiceMock: MockProxy<WalletService>
  let mnemonicRepositoryMock: MockProxy<SeedRepository>
  let backupServiceMock: MockProxy<BackupService>
  let seedService: SeedService

  const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'

  beforeEach(async () => {
    mnemonicRepositoryMock = mock<SeedRepository>()
    mnemonicRepositoryMock.save.mockResolvedValue({
      mnemonic,
      keyId: 'keyId',
      origin: Origin.GENERATED
    })

    backupServiceMock = mock<BackupService>()
    backupServiceMock.tryBackup.mockResolvedValue(undefined)

    walletServiceMock = mock<WalletService>()
    walletServiceMock.save.mockResolvedValue({
      id: 'walletId',
      address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      publicKey: await publicKeyToHex(secp256k1PrivateKeyToPublicJwk(PRIVATE_KEY)),
      privateKey: PRIVATE_KEY,
      origin: Origin.GENERATED
    })
    walletServiceMock.generate.mockResolvedValue([
      {
        id: 'walletId',
        derivationPath: "m/44'/60'/0'/0/0",
        address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
        publicKey: await publicKeyToHex(secp256k1PrivateKeyToPublicJwk(PRIVATE_KEY)),
        privateKey: PRIVATE_KEY,
        origin: Origin.GENERATED
      }
    ])

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: WalletService,
          useValue: walletServiceMock
        },
        {
          provide: ImportRepository,
          useValue: {}
        },
        {
          provide: SeedRepository,
          useValue: mnemonicRepositoryMock
        },
        {
          provide: BackupService,
          useValue: backupServiceMock
        }
      ]
    }).compile()

    seedService = module.get<SeedService>(SeedService)
  })
  it('returns first derived wallet from a generated mnemonic', async () => {
    const { wallet } = await seedService.generate('clientId', {})
    expect(wallet.derivationPath).toEqual("m/44'/60'/0'/0/0")
  })
  it('saves mnemonic to the database', async () => {
    await seedService.generate('clientId', {})
    expect(mnemonicRepositoryMock.save).toHaveBeenCalledWith('clientId', {
      mnemonic: expect.any(String),
      keyId: expect.any(String),
      origin: Origin.GENERATED
    })
  })
})
