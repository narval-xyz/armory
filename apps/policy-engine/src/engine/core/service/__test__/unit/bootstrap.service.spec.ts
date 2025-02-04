import { ConfigModule } from '@narval/config-module'
import { EncryptionService } from '@narval/encryption-module'
import { LoggerModule } from '@narval/nestjs-shared'
import { HttpSource, SourceType } from '@narval/policy-engine-shared'
import { Alg, SigningAlg, privateKeyToJwk, secp256k1PrivateKeyToPublicJwk } from '@narval/signature'
import { Test } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { generatePrivateKey } from 'viem/accounts'
import { BootstrapService } from '../../../../../client/core/service/bootstrap.service'
import { ClientService } from '../../../../../client/core/service/client.service'
import { load } from '../../../../../policy-engine.config'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { Client } from '../../../../../shared/type/domain.type'

describe(BootstrapService.name, () => {
  let bootstrapService: BootstrapService
  let clientServiceMock: MockProxy<ClientService>
  let encryptionServiceMock: MockProxy<EncryptionService>

  const dataStoreSource: HttpSource = {
    type: SourceType.HTTP,
    url: 'http://9.9.9.9:90'
  }

  const dataStore = {
    entity: {
      data: dataStoreSource,
      signature: dataStoreSource,
      keys: []
    },
    policy: {
      data: dataStoreSource,
      signature: dataStoreSource,
      keys: []
    }
  }

  const clientOneSignerKey = generatePrivateKey()
  const clientOne: Client = {
    dataStore,
    clientId: 'test-client-one-id',
    name: 'test-client-one',
    configurationSource: 'dynamic',
    baseUrl: null,
    auth: {
      disabled: false,
      local: {
        clientSecret: 'unsafe-client-secret'
      }
    },
    decisionAttestation: {
      disabled: false,
      signer: {
        alg: SigningAlg.EIP191,
        keyId: 'test-key-id',
        publicKey: secp256k1PrivateKeyToPublicJwk(clientOneSignerKey),
        privateKey: privateKeyToJwk(clientOneSignerKey, Alg.ES256K)
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const clientTwoSignerKey = generatePrivateKey()
  const clientTwo: Client = {
    dataStore,
    clientId: 'test-client-two-id',
    name: 'test-client-two',
    configurationSource: 'dynamic',
    baseUrl: null,
    auth: {
      disabled: false,
      local: {
        clientSecret: 'unsafe-client-secret'
      }
    },
    decisionAttestation: {
      disabled: false,
      signer: {
        alg: SigningAlg.EIP191,
        keyId: 'test-key-id-2',
        publicKey: secp256k1PrivateKeyToPublicJwk(clientTwoSignerKey),
        privateKey: privateKeyToJwk(clientTwoSignerKey, Alg.ES256K)
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(async () => {
    clientServiceMock = mock<ClientService>()
    clientServiceMock.findAll.mockResolvedValue([clientOne, clientTwo])

    encryptionServiceMock = mock<EncryptionService>()
    encryptionServiceMock.getKeyring.mockReturnValue(getTestRawAesKeyring())

    const module = await Test.createTestingModule({
      imports: [
        LoggerModule.forTest(),
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        })
      ],
      providers: [
        BootstrapService,
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
  })
})
