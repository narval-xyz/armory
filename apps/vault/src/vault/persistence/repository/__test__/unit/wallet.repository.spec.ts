import { Origin } from '@narval/armory-sdk'
import { EncryptionModule, EncryptionService } from '@narval/encryption-module'
import { Test } from '@nestjs/testing'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { Collection, PrivateWallet } from '../../../../../shared/type/domain.type'
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

  describe('findByClientId', () => {
    const clientId = 'test-client-id'
    const secondClientId = 'test-client-id-2'
    const privateKey = generatePrivateKey()
    const account = privateKeyToAccount(privateKey)
    const secondPrivateKey = generatePrivateKey()
    const secondAccount = privateKeyToAccount(secondPrivateKey)
    const thirdPrivateKey = generatePrivateKey()
    const thirdAccount = privateKeyToAccount(thirdPrivateKey)
    const wallet: PrivateWallet = {
      id: 'test-WALLET-ID',
      privateKey,
      address: account.address,
      origin: Origin.GENERATED,
      publicKey: account.publicKey
    }
    const secondWallet: PrivateWallet = {
      id: 'test-WALLET-ID-2',
      privateKey: secondPrivateKey,
      address: secondAccount.address,
      origin: Origin.IMPORTED,
      publicKey: secondAccount.publicKey
    }
    const thirdWallet: PrivateWallet = {
      id: 'test-WALLET-ID-3',
      privateKey: thirdPrivateKey,
      address: thirdAccount.address,
      origin: Origin.IMPORTED,
      publicKey: thirdAccount.publicKey
    }
    it('find all wallets for a given client', async () => {
      await repository.save(clientId, wallet)
      await repository.save(clientId, secondWallet)
      await repository.save(secondClientId, thirdWallet)

      const wallets = await repository.findByClientId(clientId)
      expect(wallets).toEqual([wallet, secondWallet])

      const secondWallets = await repository.findByClientId(secondClientId)
      expect(secondWallets).toEqual([thirdWallet])
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
