import { Module } from '@nestjs/common'
import { ClientModule } from '../client/client.module'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { EncryptionKeyService } from './core/service/encryption-key.service'
import { EncryptionKeyController } from './http/rest/controller/rest/encryption-key.controller'
import { EncryptionKeyRepository } from './persistence/encryption-key.repository'

@Module({
  imports: [
    PersistenceModule,
    // Required by the AuthorizationGuard.
    ClientModule
  ],
  providers: [EncryptionKeyRepository, EncryptionKeyService],
  exports: [EncryptionKeyService],
  controllers: [EncryptionKeyController]
})
export class TransitEncryptionModule {}
