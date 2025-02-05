import { EncryptionModule } from '@narval/encryption-module'
import { LoggerModule, StatefulTraceService, TraceService } from '@narval/nestjs-shared'
import { DataStoreConfiguration, FIXTURE, HttpSource, SourceType } from '@narval/policy-engine-shared'
import { Alg, SigningAlg, getPublicKey, privateKeyToJwk, secp256k1PrivateKeyToPublicJwk } from '@narval/signature'
import { Test } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { generatePrivateKey } from 'viem/accounts'
import { ClientService } from '../../../../../client/core/service/client.service'
import { ClientRepository } from '../../../../../client/persistence/repository/client.repository'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { Client } from '../../../../../shared/type/domain.type'
import { DataStoreService } from '../../data-store.service'
import { SimpleSigningService } from '../../signing-basic.service'

describe(ClientService.name, () => {
  let clientService: ClientService
  let clientRepositoryMock: MockProxy<ClientRepository>
  let dataStoreServiceMock: MockProxy<DataStoreService>

  const clientId = 'test-client-id'

  const dataStoreSource: HttpSource = {
    type: SourceType.HTTP,
    url: 'a-url-that-doesnt-need-to-exist-for-the-purpose-of-this-test'
  }

  const dataStoreConfiguration: DataStoreConfiguration = {
    data: dataStoreSource,
    signature: dataStoreSource,
    keys: [getPublicKey(privateKeyToJwk(generatePrivateKey()))]
  }

  const clientSignerKey = generatePrivateKey()
  const client: Client = {
    clientId,
    name: 'test-client',
    configurationSource: 'dynamic',
    baseUrl: null,
    auth: {
      disabled: false,
      local: {
        clientSecret: 'unsafe-client-secret'
      }
    },
    dataStore: {
      entity: dataStoreConfiguration,
      policy: dataStoreConfiguration
    },
    decisionAttestation: {
      disabled: false,
      signer: {
        alg: SigningAlg.EIP191,
        keyId: 'test-key-id',
        publicKey: secp256k1PrivateKeyToPublicJwk(clientSignerKey),
        privateKey: privateKeyToJwk(clientSignerKey, Alg.ES256K)
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const stores = {
    entity: {
      data: FIXTURE.ENTITIES,
      signature: 'test-signature'
    },
    policy: {
      data: FIXTURE.POLICIES,
      signature: 'test-signature'
    }
  }

  beforeEach(async () => {
    dataStoreServiceMock = mock<DataStoreService>()
    clientRepositoryMock = mock<ClientRepository>()
    dataStoreServiceMock.fetch.mockResolvedValue(stores)

    const module = await Test.createTestingModule({
      imports: [
        LoggerModule.forTest(),
        EncryptionModule.register({
          keyring: getTestRawAesKeyring()
        })
      ],
      providers: [
        ClientService,
        EncryptKeyValueService,
        {
          provide: DataStoreService,
          useValue: dataStoreServiceMock
        },
        {
          provide: KeyValueRepository,
          useClass: InMemoryKeyValueRepository
        },
        {
          provide: 'SigningService',
          useValue: SimpleSigningService
        },
        {
          provide: TraceService,
          useClass: StatefulTraceService
        },
        {
          provide: ClientRepository,
          useValue: clientRepositoryMock
        }
      ]
    }).compile()

    clientService = module.get<ClientService>(ClientService)
  })

  describe('save', () => {
    beforeEach(async () => {
      clientRepositoryMock.save.mockResolvedValue(client)
      clientRepositoryMock.findById.mockResolvedValue(client)
    })
    it('does not hash the client secret because it is already hashed', async () => {
      await clientService.save(client)

      const actualClient = await clientService.findById(client.clientId)

      expect(actualClient?.auth.local?.clientSecret).toEqual(client.auth.local?.clientSecret)
    })
  })

  describe('syncDataStore', () => {
    beforeEach(async () => {
      clientRepositoryMock.save.mockResolvedValue(client)
      clientRepositoryMock.findById.mockResolvedValue(client)
    })

    it('fetches the data stores once', async () => {
      await clientService.syncDataStore(clientId)

      expect(dataStoreServiceMock.fetch).toHaveBeenCalledTimes(1)
      expect(dataStoreServiceMock.fetch).toHaveBeenCalledWith(client.dataStore)
    })
  })
})
