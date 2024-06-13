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
import { Client, Origin } from '../../../../../shared/type/domain.type'
import { BackupRepository } from '../../../../persistence/repository/backup.repository'
import { ImportRepository } from '../../../../persistence/repository/import.repository'
import { RootKeyRepository } from '../../../../persistence/repository/root-key.repository'
import { WalletRepository } from '../../../../persistence/repository/_OLD_WALLET_.repository'
import { KeyGenerationService } from '../../key-generation.service'

const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

const clientId = uuid()

// Engine key used to sign the approval request
const clientPublicJWK = secp256k1PrivateKeyToPublicJwk(PRIVATE_KEY)

const client: Client = {
  clientId,
  engineJwk: clientPublicJWK,
  createdAt: new Date(),
  updatedAt: new Date()
}

describe('GenerateService', () => {
  let _OLD_WALLET_RepositoryMock: MockProxy<WalletRepository>
  let rootKeyRepositoryMock: MockProxy<RootKeyRepository>
  let clientServiceMock: MockProxy<ClientService>

  let keyGenerationService: KeyGenerationService

  const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'

  beforeEach(async () => {
    clientServiceMock = mock<ClientService>()
    clientServiceMock.findById.mockResolvedValue(client)

    rootKeyRepositoryMock = mock<RootKeyRepository>()
    rootKeyRepositoryMock.save.mockResolvedValue({
      mnemonic,
      keyId: 'keyId',
      origin: Origin.GENERATED
    })

    _OLD_WALLET_RepositoryMock = mock<WalletRepository>()
    _OLD_WALLET_RepositoryMock.save.mockResolvedValue({
      id: '_OLD_WALLET_Id',
      address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      publicKey: await publicKeyToHex(secp256k1PrivateKeyToPublicJwk(PRIVATE_KEY)),
      privateKey: PRIVATE_KEY,
      origin: Origin.GENERATED
    })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeyGenerationService,
        {
          provide: WalletRepository,
          useValue: _OLD_WALLET_RepositoryMock
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
          provide: RootKeyRepository,
          useValue: rootKeyRepositoryMock
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
    jest.spyOn(keyGenerationService, 'getIndexes').mockResolvedValue([])
  })

  it('returns first derived _OLD_WALLET_ from a generated rootKey', async () => {
    const { _OLD_WALLET_ } = await keyGenerationService.generateMnemonic('clientId', {})

    expect(_OLD_WALLET_.derivationPath).toEqual("m/44'/60'/0'/0/0")
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

  it('saves rootKey to the database', async () => {
    await keyGenerationService.generateMnemonic('clientId', {})
    expect(rootKeyRepositoryMock.save).toHaveBeenCalledWith('clientId', {
      mnemonic: expect.any(String),
      keyId: expect.any(String),
      origin: Origin.GENERATED
    })
  })
})
