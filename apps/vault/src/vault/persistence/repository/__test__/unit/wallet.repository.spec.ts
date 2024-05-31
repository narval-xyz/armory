import { EncryptionModule, EncryptionService } from '@narval/encryption-module'
import { Test } from '@nestjs/testing'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { Collection, Origin, PrivateWallet } from '../../../../../shared/type/domain.type'
import { WalletRepository } from '../../wallet.repository'

describe(WalletRepository.name, () => {
  let repository: WalletRepository
  let inMemoryKeyValueRepository: InMemoryKeyValueRepository
  let encryptionService: EncryptionService

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
        WalletRepository,
        {
          provide: KeyValueRepository,
          useValue: inMemoryKeyValueRepository
        }
      ]
    }).compile()

    repository = module.get<WalletRepository>(WalletRepository)
    encryptionService = module.get<EncryptionService>(EncryptionService)
  })

  describe('save', () => {
    const clientId = 'test-client-id'
    const privateKey = generatePrivateKey()
    const account = privateKeyToAccount(privateKey)
    const wallet: PrivateWallet = {
      id: 'test-WALLET-ID',
      privateKey,
      address: account.address,
      origin: Origin.GENERATED,
      publicKey: account.publicKey
    }

    it('uses lower case id in the key', async () => {
      jest.spyOn(inMemoryKeyValueRepository, 'set')

      await repository.save(clientId, wallet)

      expect(inMemoryKeyValueRepository.set).toHaveBeenCalledWith(
        `wallet:${clientId}:${wallet.id.toLowerCase()}`,
        expect.any(String),
        {
          clientId,
          collection: Collection.WALLET
        }
      )
    })

    it('encrypts wallet data', async () => {
      await repository.save(clientId, wallet)

      const actualEncryptedWallet = await inMemoryKeyValueRepository.get(
        `wallet:${clientId}:${wallet.id.toLowerCase()}`
      )

      const actualWallet = await encryptionService
        .decrypt(Buffer.from(actualEncryptedWallet as string, 'hex'))
        .then((v) => JSON.parse(v.toString()))

      expect(actualWallet).toEqual(wallet)
    })
  })

  describe('findById', () => {
    it('uses lower case id', async () => {
      jest.spyOn(inMemoryKeyValueRepository, 'get')

      const clientId = 'test-client-id'
      const caseSensitiveWalletId = 'test-WALLET-ID'

      await repository.findById(clientId, caseSensitiveWalletId)

      expect(inMemoryKeyValueRepository.get).toHaveBeenCalledWith(
        `wallet:${clientId}:${caseSensitiveWalletId.toLowerCase()}`
      )
    })
  })
})
