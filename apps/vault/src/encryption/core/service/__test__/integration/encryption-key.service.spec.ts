import { ConfigModule } from '@narval/config-module'
import { LoggerModule } from '@narval/nestjs-shared'
import { getPublicKey, rsaPrivateKeySchema, rsaPublicKeySchema } from '@narval/signature'
import { Test } from '@nestjs/testing'
import { v4 as uuid } from 'uuid'
import { load } from '../../../../../main.config'
import { PersistenceModule } from '../../../../../shared/module/persistence/persistence.module'
import { EncryptionKeyRepository } from '../../../../persistence/encryption-key.repository'
import { EncryptionKeyService } from '../../encryption-key.service'

describe(EncryptionKeyService.name, () => {
  let encryptionKeyService: EncryptionKeyService
  let encryptionKeyRepository: EncryptionKeyRepository

  const clientId = uuid()

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        PersistenceModule,
        LoggerModule.forTest(),
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        })
      ],
      providers: [EncryptionKeyService, EncryptionKeyRepository]
    }).compile()

    encryptionKeyService = module.get(EncryptionKeyService)
    encryptionKeyRepository = module.get(EncryptionKeyRepository)
  })

  describe('generate', () => {
    it('returns rsa private and public keys', async () => {
      const encryptionKey = await encryptionKeyService.generate(clientId)

      expect(rsaPrivateKeySchema.safeParse(encryptionKey.privateKey).success).toEqual(true)
      expect(rsaPublicKeySchema.safeParse(encryptionKey.publicKey).success).toEqual(true)
    })

    it('uses private kid as id', async () => {
      const { privateKey } = await encryptionKeyService.generate(clientId)

      const encryptionKey = await encryptionKeyRepository.findByKid(privateKey.kid)

      expect(encryptionKey).toMatchObject({
        clientId,
        privateKey,
        publicKey: getPublicKey(privateKey)
      })
    })
  })

  describe('decrypt', () => {
    it.todo('throws InvalidJweHeaderException when kid is missing')
    it.todo('throws NotFoundException when encryption key is not found')
    it.todo('throws UnauthorizedException when encryption key clientId is different than the given clientId')
    it.todo('decrypts data using rsa private key')
  })
})
