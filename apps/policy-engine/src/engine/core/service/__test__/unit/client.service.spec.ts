import { EncryptionModule } from '@narval/encryption-module'
import { LoggerModule, StatefulTraceService, TraceService, secret } from '@narval/nestjs-shared'
import { DataStoreConfiguration, FIXTURE, HttpSource, SourceType } from '@narval/policy-engine-shared'
import { Alg, getPublicKey, privateKeyToJwk } from '@narval/signature'
import { Test } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { generatePrivateKey } from 'viem/accounts'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { Client } from '../../../../../shared/type/domain.type'
import { ClientRepository } from '../../../../persistence/repository/client.repository'
import { ClientService } from '../../client.service'
import { DataStoreService } from '../../data-store.service'
import { SimpleSigningService } from '../../signing-basic.service'

describe(ClientService.name, () => {
  let clientService: ClientService
  let clientRepository: ClientRepository
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

  const client: Client = {
    clientId,
    clientSecret: secret.hash('test-client-secret'),
    dataStore: {
      entity: dataStoreConfiguration,
      policy: dataStoreConfiguration
    },
    signer: {
      privateKey: privateKeyToJwk(generatePrivateKey(), Alg.ES256K)
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
        ClientRepository,
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
        }
      ]
    }).compile()

    clientService = module.get<ClientService>(ClientService)
    clientRepository = module.get<ClientRepository>(ClientRepository)
  })

  describe('save', () => {
    it('does not hash the client secret because it is already hashed', async () => {
      await clientService.save(client)

      const actualClient = await clientService.findById(client.clientId)

      expect(actualClient?.clientSecret).toEqual(client.clientSecret)
    })
  })

  describe('syncDataStore', () => {
    beforeEach(async () => {
      await clientRepository.save(client)
    })

    it('saves entity and policy stores', async () => {
      expect(await clientRepository.findEntityStore(clientId)).toEqual(null)
      expect(await clientRepository.findPolicyStore(clientId)).toEqual(null)

      await clientService.syncDataStore(clientId)

      expect(await clientRepository.findEntityStore(clientId)).toEqual(stores.entity)
      expect(await clientRepository.findPolicyStore(clientId)).toEqual(stores.policy)
    })

    it('fetches the data stores once', async () => {
      await clientService.syncDataStore(clientId)

      expect(dataStoreServiceMock.fetch).toHaveBeenCalledTimes(1)
      expect(dataStoreServiceMock.fetch).toHaveBeenCalledWith(client.dataStore)
    })
  })
})
