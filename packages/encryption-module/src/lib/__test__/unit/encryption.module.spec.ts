import { RawAesKeyringNode, RawAesWrappingSuiteIdentifier } from '@aws-crypto/client-node'
import { EncryptionModule } from '../../encryption.module'
import { generateKeyEncryptionKey } from '../../encryption.util'

describe(EncryptionModule.name, () => {
  describe('registerAsync', () => {
    it('creates a dynamic module with a custom keyring', async () => {
      const module = EncryptionModule.registerAsync({
        useFactory: () => ({
          keyring: new RawAesKeyringNode({
            keyName: 'test.key.name',
            keyNamespace: 'test.key.namespace',
            unencryptedMasterKey: generateKeyEncryptionKey('test-password', 'test-salt'),
            wrappingSuite: RawAesWrappingSuiteIdentifier.AES256_GCM_IV12_TAG16_NO_PADDING
          })
        })
      })

      expect(module).toBeDefined()
    })
  })
})
