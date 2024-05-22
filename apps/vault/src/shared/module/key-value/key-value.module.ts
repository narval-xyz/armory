import { EncryptionModule } from '@narval/encryption-module'
import { Module, forwardRef } from '@nestjs/common'
import { ConfigService } from 'packages/config-module/src/lib/config.service'
import { AppService } from '../../../vault/core/service/app.service'
import { VaultModule } from '../../../vault/vault.module'
import { EncryptionModuleOptionFactory } from '../../factory/encryption-module-option.factory'
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
      imports: [forwardRef(() => VaultModule)],
      inject: [ConfigService, AppService],
      useClass: EncryptionModuleOptionFactory
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
