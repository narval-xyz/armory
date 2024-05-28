import {
  RsaPrivateKey,
  generateJwk,
  publicKeyToHex,
  rsaDecrypt,
  secp256k1PrivateKeyToPublicJwk
} from '@narval/signature'
import { Test, TestingModule } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { v4 as uuid } from 'uuid'
import { ClientService } from '../../../../../client/core/service/client.service'
import { Client, SeedOrigin } from '../../../../../shared/type/domain.type'
import { BackupRepository } from '../../../../persistence/repository/backup.repository'
import { ImportRepository } from '../../../../persistence/repository/import.repository'
import { MnemonicRepository } from '../../../../persistence/repository/mnemonic.repository'
import { WalletRepository } from '../../../../persistence/repository/wallet.repository'
import { KeyGenerationService } from '../../key-generation.service'

const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

const clientId = uuid()
const clientSecret = 'test-client-secret'

// Engine key used to sign the approval request
const clientPublicJWK = secp256k1PrivateKeyToPublicJwk(PRIVATE_KEY)

const client: Client = {
  clientId,
  clientSecret,
  engineJwk: clientPublicJWK,
  createdAt: new Date(),
  updatedAt: new Date()
}

describe('GenerateService', () => {
  let walletRepositoryMock: MockProxy<WalletRepository>
  let mnemonicRepositoryMock: MockProxy<MnemonicRepository>
  let clientServiceMock: MockProxy<ClientService>

  let keyGenerationService: KeyGenerationService

  const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'

  beforeEach(async () => {
    clientServiceMock = mock<ClientService>()
    clientServiceMock.findById.mockResolvedValue(client)

    mnemonicRepositoryMock = mock<MnemonicRepository>()
    mnemonicRepositoryMock.save.mockResolvedValue({
      mnemonic,
      keyId: 'keyId',
      origin: SeedOrigin.GENERATED,
      nextAddrIndex: 1
    })

    walletRepositoryMock = mock<WalletRepository>()
    walletRepositoryMock.save.mockResolvedValue({
      id: 'walletId',
      address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      publicKey: await publicKeyToHex(secp256k1PrivateKeyToPublicJwk(PRIVATE_KEY)),
      privateKey: PRIVATE_KEY
    })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeyGenerationService,
        {
          provide: WalletRepository,
          useValue: walletRepositoryMock
        },
        {
          provide: ImportRepository,
          useValue: {}
        },
        {
          provide: ClientService,
          useValue: clientServiceMock
        },
        {
          provide: MnemonicRepository,
          useValue: mnemonicRepositoryMock
        },
        {
          provide: BackupRepository,
          useValue: {
            save: jest.fn()
          }
        }
      ]
    }).compile()

    keyGenerationService = module.get<KeyGenerationService>(KeyGenerationService)
  })
  it('returns first derived wallet from a generated mnemonic', async () => {
    const { wallet } = await keyGenerationService.generateMnemonic('clientId', {})
    expect(wallet.derivationPath).toEqual("m/44'/60'/0'/0/0")
  })
  it('returns an encrypted backup if client has an RSA backupKey configured', async () => {
    const rsaBackupKey = await generateJwk<RsaPrivateKey>('RS256')

    clientServiceMock.findById.mockResolvedValue({
      ...client,
      backupPublicKey: rsaBackupKey
    })

    const { backup } = await keyGenerationService.generateMnemonic('clientId', {})
    const decryptedMnemonic = await rsaDecrypt(backup as string, rsaBackupKey)
    const spaceInMnemonic = decryptedMnemonic.split(' ')
    expect(spaceInMnemonic.length).toBe(12)
  })
  it('saves mnemonic to the database', async () => {
    await keyGenerationService.generateMnemonic('clientId', {})
    expect(mnemonicRepositoryMock.save).toHaveBeenCalledWith('clientId', {
      mnemonic: expect.any(String),
      keyId: expect.any(String),
      origin: SeedOrigin.GENERATED,
      nextAddrIndex: 0
    })
  })
})
