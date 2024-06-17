import { EncryptionModule } from '@narval/encryption-module'
import { Test } from '@nestjs/testing'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { RootKeyRepository } from '../../root-key.repository'

describe('MnemonicRepository', () => {
  let repository: RootKeyRepository

  let inMemoryKeyValueRepository: InMemoryKeyValueRepository

  beforeEach(async () => {
    inMemoryKeyValueRepository = new InMemoryKeyValueRepository()

    const module = await Test.createTestingModule({
      imports: [
        EncryptionModule.register({
          keyring: getTestRawAesKeyring()
        })
      ],
      providers: [
        EncryptKeyValueService,
        RootKeyRepository,
        {
          provide: KeyValueRepository,
          useValue: inMemoryKeyValueRepository
        }
      ]
    }).compile()

    repository = module.get<RootKeyRepository>(RootKeyRepository)
  })

  describe('save', () => {
    const clientId = 'test-client-id'
    const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'
    const keyId = 'keyId'

    it('uses lower case id in the key', async () => {
      jest.spyOn(inMemoryKeyValueRepository, 'set')

      await repository.save(clientId, {
        mnemonic,
        keyId,
        origin: 'GENERATED',
        curve: 'secp256k1',
        keyType: 'local'
      })

      expect(inMemoryKeyValueRepository.set).toHaveBeenCalledWith(
        `root-key:${clientId}:${keyId.toLowerCase()}`,
        expect.any(String),
        {
          clientId,
          collection: 'root-key'
        }
      )
    })
  })
})
