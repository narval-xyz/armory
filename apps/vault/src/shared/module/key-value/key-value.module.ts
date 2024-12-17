import { ConfigService } from '@narval/config-module'
import { EncryptionModule } from '@narval/encryption-module'
import { LoggerService } from '@narval/nestjs-shared'
import { Module, forwardRef } from '@nestjs/common'
import { AppService } from '../../../app.service'
import { AppModule } from '../../../main.module'
import { EncryptionModuleOptionFactory } from '../../factory/encryption-module-option.factory'
import { PersistenceModule } from '../persistence/persistence.module'
import { KeyValueRepository } from './core/repository/key-value.repository'
import { EncryptKeyValueService } from './core/service/encrypt-key-value.service'
import { KeyValueService } from './core/service/key-value.service'
import { InMemoryKeyValueRepository } from './persistence/repository/in-memory-key-value.repository'
import { PrismaKeyValueRepository } from './persistence/repository/prisma-key-value.repository'

@Module({
  imports: [
    PersistenceModule.register({
      imports: [] // Specifically erase the imports, so we do NOT initialize the EncryptionModule since KV will handle it's own encryption
    }),
    EncryptionModule.registerAsync({
      imports: [forwardRef(() => AppModule)],
      inject: [ConfigService, AppService, LoggerService],
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
