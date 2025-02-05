import { ConfigModule } from '@narval/config-module'
import { EncryptionModuleOptionProvider } from '@narval/encryption-module'
import { LoggerModule } from '@narval/nestjs-shared'
import {
  Alg,
  RsaPublicKey,
  SMALLEST_RSA_MODULUS_LENGTH,
  Use,
  generateJwk,
  getPublicKey,
  rsaEncrypt,
  rsaPrivateKeySchema,
  rsaPrivateKeyToPublicKey,
  rsaPublicKeySchema
} from '@narval/signature'
import { Test } from '@nestjs/testing'
import { omit } from 'lodash'
import { v4 as uuid } from 'uuid'
import { load } from '../../../../../main.config'
import { AppModule } from '../../../../../main.module'
import { PersistenceModule } from '../../../../../shared/module/persistence/persistence.module'
import { getTestRawAesKeyring } from '../../../../../shared/testing/encryption.testing'
import { EncryptionKeyRepository } from '../../../../persistence/encryption-key.repository'
import { InvalidJweHeaderException } from '../../../exception/invalid-jwe-header.exception'
import { NotFoundException } from '../../../exception/not-found.exception'
import { UnauthorizedException } from '../../../exception/unauthorized.exception'
import { EncryptionKey } from '../../../type/encryption-key.type'
import { EncryptionKeyService } from '../../encryption-key.service'

const GENERATE_RSA_KEY_OPTIONS: { use: Use; modulusLength: number } = {
  use: 'enc',
  modulusLength: SMALLEST_RSA_MODULUS_LENGTH
}

describe(EncryptionKeyService.name, () => {
  let encryptionKeyService: EncryptionKeyService
  let encryptionKeyRepository: EncryptionKeyRepository

  const clientId = uuid()

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        LoggerModule.forTest(),
        ConfigModule.forRoot({
          load: [load],
          isGlobal: true
        }),
        AppModule,
        PersistenceModule.forRoot()
      ],
      providers: [EncryptionKeyService, EncryptionKeyRepository]
    })
      .overrideProvider(EncryptionModuleOptionProvider)
      .useValue({
        keyring: getTestRawAesKeyring()
      })
      .compile()

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
    it('decrypts data using rsa private key', async () => {
      const privateKey = await generateJwk(Alg.RS256, { use: 'enc', modulusLength: 2048 })
      const publicKey = rsaPrivateKeyToPublicKey(privateKey)
      const encryptionKey = {
        clientId,
        privateKey,
        publicKey,
        createdAt: new Date()
      }
      await encryptionKeyRepository.create(encryptionKey)

      const secret = 'secret message'
      const encryptedData = await rsaEncrypt(secret, publicKey)

      const decryptedData = await encryptionKeyService.decrypt(clientId, encryptedData)
      expect(decryptedData).toBe(secret)
    })

    it('throws InvalidJweHeaderException when public key kid is missing', async () => {
      const privateKey = await generateJwk(Alg.RS256, GENERATE_RSA_KEY_OPTIONS)
      const publicKey = omit(rsaPrivateKeyToPublicKey(privateKey), 'kid')

      // Mock the repository to bypass schema validation
      jest.spyOn(encryptionKeyRepository, 'create').mockImplementationOnce((encryptionKey) => {
        return Promise.resolve({
          ...encryptionKey,
          publicKey: omit(publicKey, 'kid')
        } as EncryptionKey)
      })

      const encryptionKey = {
        clientId,
        privateKey,
        publicKey,
        createdAt: new Date()
      }

      await encryptionKeyRepository.create(encryptionKey as EncryptionKey)
      const encryptedData = await rsaEncrypt('secret', publicKey as RsaPublicKey)

      try {
        await encryptionKeyService.decrypt(clientId, encryptedData)
        fail('expected to have thrown InvalidJweHeaderException')
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidJweHeaderException)
      }
    })

    it('throws NotFoundException when encryption key is not found', async () => {
      const privateKey = await generateJwk(Alg.RS256, GENERATE_RSA_KEY_OPTIONS)
      const publicKey = rsaPrivateKeyToPublicKey(privateKey)
      const encryptedData = await rsaEncrypt('secret', publicKey)

      try {
        await encryptionKeyService.decrypt(clientId, encryptedData)
        fail('expected to have thrown NotFoundException')
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException)
        expect(error.context).toEqual({ kid: publicKey.kid })
      }
    })

    it('throws UnauthorizedException when encryption key clientId is different than the given clientId', async () => {
      const differentClientId = uuid()
      const privateKey = await generateJwk(Alg.RS256, GENERATE_RSA_KEY_OPTIONS)
      const publicKey = rsaPrivateKeyToPublicKey(privateKey)
      const encryptionKey = {
        clientId: differentClientId,
        privateKey,
        publicKey,
        createdAt: new Date()
      }
      await encryptionKeyRepository.create(encryptionKey)
      const encryptedData = await rsaEncrypt('secret', publicKey)

      try {
        await encryptionKeyService.decrypt(clientId, encryptedData)
        fail('expected to have thrown UnauthorizedException')
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException)
        expect(error.context).toEqual({
          kid: publicKey.kid,
          clientId
        })
      }
    })
  })
})
