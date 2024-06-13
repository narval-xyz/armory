import { EncryptionModule, EncryptionService } from '@narval/encryption-module'
import { Test } from '@nestjs/testing'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { Collection, Origin, PrivateAccount } from '../../../../../shared/type/domain.type'
import { AccountRepository } from '../../account.repository'

describe(AccountRepository.name, () => {
  let repository: AccountRepository
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
        AccountRepository,
        {
          provide: KeyValueRepository,
          useValue: inMemoryKeyValueRepository
        }
      ]
    }).compile()

    repository = module.get<AccountRepository>(AccountRepository)
    encryptionService = module.get<EncryptionService>(EncryptionService)
  })

  describe('save', () => {
    const clientId = 'test-client-id'
    const privateKey = generatePrivateKey()
    const viemAcc = privateKeyToAccount(privateKey)
    const account: PrivateAccount = {
      id: 'test-WALLET-ID',
      privateKey,
      address: viemAcc.address,
      origin: Origin.GENERATED,
      publicKey: viemAcc.publicKey
    }

    it('uses lower case id in the key', async () => {
      jest.spyOn(inMemoryKeyValueRepository, 'set')

      await repository.save(clientId, account)

      expect(inMemoryKeyValueRepository.set).toHaveBeenCalledWith(
        `account:${clientId}:${account.id.toLowerCase()}`,
        expect.any(String),
        {
          clientId,
          collection: Collection.ACCOUNT
        }
      )
    })

    it('encrypts account data', async () => {
      await repository.save(clientId, account)

      const actualEncryptedAccount = await inMemoryKeyValueRepository.get(
        `account:${clientId}:${account.id.toLowerCase()}`
      )

      const actualAccount = await encryptionService
        .decrypt(Buffer.from(actualEncryptedAccount as string, 'hex'))
        .then((v) => JSON.parse(v.toString()))

      expect(actualAccount).toEqual(account)
    })
  })

  describe('findByClientId', () => {
    const clientId = 'test-client-id'
    const secondClientId = 'test-client-id-2'
    const privateKey = generatePrivateKey()
    const viemAcc = privateKeyToAccount(privateKey)
    const secondPrivateKey = generatePrivateKey()
    const secondViemAccount = privateKeyToAccount(secondPrivateKey)
    const thirdPrivateKey = generatePrivateKey()
    const thirdViemAccount = privateKeyToAccount(thirdPrivateKey)
    const account: PrivateAccount = {
      id: 'test-WALLET-ID',
      privateKey,
      address: viemAcc.address,
      origin: Origin.GENERATED,
      publicKey: viemAcc.publicKey
    }
    const secondAccount: PrivateAccount = {
      id: 'test-WALLET-ID-2',
      privateKey: secondPrivateKey,
      address: secondViemAccount.address,
      origin: Origin.IMPORTED,
      publicKey: secondViemAccount.publicKey
    }
    const thirdAccount: PrivateAccount = {
      id: 'test-WALLET-ID-3',
      privateKey: thirdPrivateKey,
      address: thirdViemAccount.address,
      origin: Origin.IMPORTED,
      publicKey: thirdViemAccount.publicKey
    }
    it('find all accounts for a given client', async () => {
      await repository.save(clientId, account)
      await repository.save(clientId, secondAccount)
      await repository.save(secondClientId, thirdAccount)

      const accounts = await repository.findByClientId(clientId)
      expect(accounts).toEqual([account, secondAccount])

      const secondAccounts = await repository.findByClientId(secondClientId)
      expect(secondAccounts).toEqual([thirdAccount])
    })
  })

  describe('findById', () => {
    it('uses lower case id', async () => {
      jest.spyOn(inMemoryKeyValueRepository, 'get')

      const clientId = 'test-client-id'
      const caseSensitiveAccountId = 'test-WALLET-ID'

      await repository.findById(clientId, caseSensitiveAccountId)

      expect(inMemoryKeyValueRepository.get).toHaveBeenCalledWith(
        `account:${clientId}:${caseSensitiveAccountId.toLowerCase()}`
      )
    })
  })
})
