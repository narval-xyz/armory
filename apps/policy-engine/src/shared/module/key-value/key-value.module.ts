import { Module } from '@nestjs/common'
import { EncryptionModule } from '../../../encryption/encryption.module'
import { KeyValueRepository } from './core/repository/key-value.repository'
import { KeyValueService } from './core/service/key-value.service'
import { InMemoryKeyValueRepository } from './persistence/repository/in-memory-key-value.repository'

@Module({
  imports: [EncryptionModule],
  providers: [
    KeyValueService,
    {
      provide: KeyValueRepository,
      useClass: InMemoryKeyValueRepository
    }
  ],
  exports: [KeyValueService, KeyValueRepository]
})
export class KeyValueModule {}
