import {
  LoggerModule,
  MetricService,
  OTEL_ATTR_CLIENT_ID,
  OpenTelemetryModule,
  StatefulMetricService
} from '@narval/nestjs-shared'
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
import { AccountRepository } from '../../../../persistence/repository/account.repository'
import { BackupRepository } from '../../../../persistence/repository/backup.repository'
import { ImportRepository } from '../../../../persistence/repository/import.repository'
import { RootKeyRepository } from '../../../../persistence/repository/root-key.repository'
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
  let accountRepositoryMock: MockProxy<AccountRepository>
  let rootKeyRepositoryMock: MockProxy<RootKeyRepository>
  let clientServiceMock: MockProxy<ClientService>
  let keyGenerationService: KeyGenerationService
  let statefulMetricService: StatefulMetricService

  const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'

  beforeEach(async () => {
    clientServiceMock = mock<ClientService>()
    clientServiceMock.findById.mockResolvedValue(client)

    rootKeyRepositoryMock = mock<RootKeyRepository>()
    rootKeyRepositoryMock.save.mockResolvedValue({
      mnemonic,
      keyId: 'keyId',
      origin: Origin.GENERATED,
      curve: 'secp256k1',
      keyType: 'local'
    })

    accountRepositoryMock = mock<AccountRepository>()
    accountRepositoryMock.save.mockResolvedValue({
      id: 'accountId',
      address: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
      publicKey: await publicKeyToHex(secp256k1PrivateKeyToPublicJwk(PRIVATE_KEY)),
      privateKey: PRIVATE_KEY,
      origin: Origin.GENERATED
    })

    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule.forTest(), OpenTelemetryModule.forTest()],
      providers: [
        KeyGenerationService,
        {
          provide: AccountRepository,
          useValue: accountRepositoryMock
        },
        {
          provide: ImportRepository,
          useValue: { curve: 'secp256k1' }
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
    statefulMetricService = module.get(MetricService)

    jest.spyOn(keyGenerationService, 'getIndexes').mockResolvedValue([])
  })

  describe('generateWallet', () => {
    it('returns first derived account from a generated rootKey', async () => {
      const { account } = await keyGenerationService.generateWallet(clientId, { curve: 'secp256k1' })

      expect(account.derivationPath).toEqual("m/44'/60'/0'/0/0")
    })

    it('returns an encrypted backup if client has an RSA backupKey configured', async () => {
      const rsaBackupKey = await generateJwk<RsaPrivateKey>('RS256')

      clientServiceMock.findById.mockResolvedValue({
        ...client,
        backupPublicKey: rsaBackupKey
      })

      const { backup } = await keyGenerationService.generateWallet(clientId, { curve: 'secp256k1' })
      const decryptedMnemonic = await rsaDecrypt(backup as string, rsaBackupKey)
      const spaceInMnemonic = decryptedMnemonic.split(' ')

      expect(spaceInMnemonic.length).toBe(12)
    })

    it('saves rootKey to the database', async () => {
      await keyGenerationService.generateWallet(clientId, { curve: 'secp256k1' })

      expect(rootKeyRepositoryMock.save).toHaveBeenCalledWith(clientId, {
        mnemonic: expect.any(String),
        keyId: expect.any(String),
        origin: Origin.GENERATED,
        curve: 'secp256k1',
        keyType: 'local'
      })
    })

    it('increments counter metrics', async () => {
      await keyGenerationService.generateWallet(clientId, { curve: 'secp256k1' })

      expect(statefulMetricService.counters).toEqual([
        {
          name: 'wallet_generate_count',
          value: 1,
          attributes: {
            [OTEL_ATTR_CLIENT_ID]: clientId
          }
        },
        {
          name: 'account_generate_count',
          value: 1,
          attributes: {
            [OTEL_ATTR_CLIENT_ID]: clientId
          }
        },
        {
          name: 'account_derive_count',
          value: 1,
          attributes: {
            [OTEL_ATTR_CLIENT_ID]: clientId
          }
        }
      ])
    })
  })
})
