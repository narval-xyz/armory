import { Module } from '@nestjs/common'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { EncryptionKeyService } from './core/service/encryption-key.service'
import { EncryptionKeyRepository } from './persistence/encryption-key.repository'

@Module({
  imports: [PersistenceModule],
  providers: [EncryptionKeyRepository, EncryptionKeyService],
  exports: [EncryptionKeyService]
})
export class EncryptionKeyModule {}
