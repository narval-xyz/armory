import { ConfigModule } from '@narval/config-module'
import { EncryptionException, EncryptionService } from '@narval/encryption-module'
import { Alg, privateKeyToJwk, secp256k1PrivateKeyToJwk } from '@narval/signature'
import { Test } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { generatePrivateKey } from 'viem/accounts'
import { EngineService } from '../../../../../engine/core/service/engine.service'
import { EngineRepository } from '../../../../../engine/persistence/repository/engine.repository'
import { load } from '../../../../../policy-engine.config'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { KeyValueService } from '../../../../../shared/module/key-value/core/service/key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { Client } from '../../../../../shared/type/domain.type'
import { BootstrapException } from '../../../exception/bootstrap.exception'
import { BootstrapService } from '../../bootstrap.service'
import { ClientService } from '../../client.service'
import { EngineSignerConfigService } from '../../engine-signer-config.service'

describe(BootstrapService.name, () => {
  let bootstrapService: BootstrapService
  let clientServiceMock: MockProxy<ClientService>
  let encryptionServiceMock: MockProxy<EncryptionService>
  let engineSignerConfigServiceMock: MockProxy<EngineSignerConfigService>

  const dataStore = {
    entity: {
      dataUrl: 'http://9.9.9.9:90',
      signatureUrl: 'http://9.9.9.9:90',
      keys: []
    },
    policy: {
      dataUrl: 'http://9.9.9.9:90',
      signatureUrl: 'http://9.9.9.9:90',
      keys: []
    }
  }

  const clientOne: Client = {
    dataStore,
    clientId: 'test-client-one-id',
    clientSecret: 'unsafe-client-secret',
    signer: {
      type: 'PRIVATE_KEY',
      key: privateKeyToJwk(generatePrivateKey(), Alg.ES256K)
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const clientTwo: Client = {
    dataStore,
    clientId: 'test-client-two-id',
    clientSecret: 'unsafe-client-secret',
    signer: {
      type: 'PRIVATE_KEY',
      key: privateKeyToJwk(generatePrivateKey(), Alg.ES256K)
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(async () => {
    clientServiceMock = mock<ClientService>()
    clientServiceMock.findAll.mockResolvedValue([clientOne, clientTwo])

    encryptionServiceMock = mock<EncryptionService>()
    encryptionServiceMock.getKeyring.mockReturnValue(getTestRawAesKeyring())

    engineSignerConfigServiceMock = mock<EngineSignerConfigService>()
    engineSignerConfigServiceMock.save.mockResolvedValue(true)
    engineSignerConfigServiceMock.getSignerConfigOrThrow.mockResolvedValue({
      type: 'PRIVATE_KEY',
      key: secp256k1PrivateKeyToJwk(generatePrivateKey())
    })

    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        })
      ],
      providers: [
        BootstrapService,
        EngineRepository,
        EngineService,
        KeyValueService,
        {
          provide: KeyValueRepository,
          useClass: InMemoryKeyValueRepository
        },
        {
          provide: ClientService,
          useValue: clientServiceMock
        },
        {
          provide: EncryptionService,
          useValue: encryptionServiceMock
        },
        {
          provide: EngineSignerConfigService,
          useValue: engineSignerConfigServiceMock
        }
      ]
    }).compile()

    bootstrapService = module.get<BootstrapService>(BootstrapService)
  })

  describe('boot', () => {
    it('syncs clients data stores', async () => {
      await bootstrapService.boot()

      expect(clientServiceMock.syncDataStore).toHaveBeenNthCalledWith(1, clientOne.clientId)
      expect(clientServiceMock.syncDataStore).toHaveBeenNthCalledWith(2, clientTwo.clientId)
    })

    it('checks if the encryption keyring is configured', async () => {
      await bootstrapService.boot()

      expect(encryptionServiceMock.getKeyring).toHaveBeenCalledTimes(1)
    })

    it('throws when encryption keyring is not configure', async () => {
      encryptionServiceMock.getKeyring.mockImplementation(() => {
        throw new EncryptionException('Something went wrong')
      })

      await expect(() => bootstrapService.boot()).rejects.toThrow(BootstrapException)
      await expect(() => bootstrapService.boot()).rejects.toThrow('Encryption keyring not found')
    })
  })
})
