import { RawAesKeyringNode, RawAesWrappingSuiteIdentifier } from '@aws-crypto/client-node'
import { Test } from '@nestjs/testing'
import { MODULE_OPTIONS_TOKEN } from '../../encryption.module-definition'
import { EncryptionService } from '../../encryption.service'
import { generateKeyEncryptionKey } from '../../encryption.util'

describe(EncryptionService.name, () => {
  let encryptionService: EncryptionService

  beforeEach(async () => {
    const keyring = new RawAesKeyringNode({
      keyName: 'test.key.name',
      keyNamespace: 'test.key.namespace',
      unencryptedMasterKey: generateKeyEncryptionKey('test-password', 'test-salt'),
      wrappingSuite: RawAesWrappingSuiteIdentifier.AES256_GCM_IV12_TAG16_NO_PADDING
    })

    const module = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: MODULE_OPTIONS_TOKEN,
          useValue: { keyring }
        }
      ]
    }).compile()

    encryptionService = module.get<EncryptionService>(EncryptionService)
  })

  it('encrypts given string', async () => {
    const value = 'shh... this is a secret'
    const cipher = await encryptionService.encrypt(value)

    expect(cipher).not.toEqual(value)
  })

  it('decrypts given cipher', async () => {
    const value = 'shh... this is a secret'
    const cipher = await encryptionService.encrypt(value)
    const decrypted = await encryptionService.decrypt(cipher)

    expect(decrypted.toString()).toEqual(value)
  })
})
