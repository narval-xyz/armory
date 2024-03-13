import { RawAesKeyringNode, RawAesWrappingSuiteIdentifier } from '@aws-crypto/client-node'
import { EncryptionModule, generateKeyEncryptionKey } from '@narval/encryption-module'
import { Module } from '@nestjs/common'
import { PersistenceModule } from '../persistence/persistence.module'
import { KeyValueRepository } from './core/repository/key-value.repository'
import { EncryptKeyValueService } from './core/service/encrypt-key-value.service'
import { KeyValueService } from './core/service/key-value.service'
import { InMemoryKeyValueRepository } from './persistence/repository/in-memory-key-value.repository'
import { PrismaKeyValueRepository } from './persistence/repository/prisma-key-value.repository'

@Module({
  imports: [
    PersistenceModule,
    EncryptionModule.registerAsync({
      useFactory: () => {
        const keyring = new RawAesKeyringNode({
          keyName: 'test.key.name',
          keyNamespace: 'test.key.namespace',
          unencryptedMasterKey: generateKeyEncryptionKey('test-password', 'test-salt'),
          wrappingSuite: RawAesWrappingSuiteIdentifier.AES256_GCM_IV12_TAG16_NO_PADDING
        })

        return { keyring }
      }
    })
  ],
  providers: [
    KeyValueService,
    EncryptKeyValueService,
    InMemoryKeyValueRepository,
    PrismaKeyValueRepository,
    {
      provide: KeyValueRepository,
      useExisting: PrismaKeyValueRepository
    }
  ],
  exports: [KeyValueService, EncryptKeyValueService]
})
export class KeyValueModule {}
