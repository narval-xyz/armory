# Encryption Module

This is a NestJS module for encryption on top of `@aws-crypto/client-node`
tailored to meet the needs of the Armory server.

## Getting started

```typescript
import { RawAesKeyringNode, RawAesWrappingSuiteIdentifier } from '@aws-crypto/client-node'
import { EncryptionModule, decryptMasterKey, generateKeyEncryptionKey, isolateBuffer } from '@narval/encryption-module'
import { toBytes } from '@narval/policy-engine-shared'

@Module({
  imports: [
    EncryptionModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const salt = configService.get('ENCRYPTION_SALT')
        const password = configService.get('ENCRYPTION_PASSWORD')
        const masterKey = configService.get('ENCRYPTION_MASTER_KEY')
        const kek = generateKeyEncryptionKey(password, salt)
        const unencryptedMasterKey = await decryptMasterKey(kek, toBytes(masterKey))

        return {
          keyring: new RawAesKeyringNode({
            unencryptedMasterKey: isolateBuffer(unencryptedMasterKey),
            keyName: 'arbitrary.key.name',
            keyNamespace: 'arbitrary.key.namespace',
            wrappingSuite: RawAesWrappingSuiteIdentifier.AES256_GCM_IV12_TAG16_NO_PADDING
          })
        }
      }
    })
  ]
})
```

> Note: the module also exposes `.register` method for sync registration.
