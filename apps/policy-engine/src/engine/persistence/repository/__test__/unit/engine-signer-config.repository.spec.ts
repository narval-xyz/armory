import { EncryptionModule } from '@narval/encryption-module'
import { secp256k1PrivateKeyToJwk } from '@narval/signature'
import { Test } from '@nestjs/testing'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { SignerConfig } from '../../../../../shared/type/domain.type'
import { EngineSignerConfigRepository } from '../../engine-signer-config.repository'

describe(EngineSignerConfigRepository.name, () => {
  let repository: EngineSignerConfigRepository
  let inMemoryKeyValueRepository: InMemoryKeyValueRepository

  const engineId = 'test-engine-id'

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
        EngineSignerConfigRepository,
        {
          provide: KeyValueRepository,
          useValue: inMemoryKeyValueRepository
        }
      ]
    }).compile()

    repository = module.get<EngineSignerConfigRepository>(EngineSignerConfigRepository)
  })

  describe('save', () => {
    it('saves encrypted signer configuration', async () => {
      const signerConfig: SignerConfig = {
        type: 'PRIVATE_KEY',
        key: secp256k1PrivateKeyToJwk('0x44c75d8485a564a3c8d60ed23e7524f77bba719372f1c05807d88af6d3c09f55')
      }

      await repository.save(engineId, signerConfig)

      const value = await inMemoryKeyValueRepository.get(repository.getKey(engineId))
      const actualSignerConfig = await repository.findByEngineId(engineId)

      expect(value).not.toEqual(JSON.stringify(signerConfig))
      expect(signerConfig).toEqual(actualSignerConfig)
    })
  })
})
