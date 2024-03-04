import { HttpModule } from '@nestjs/axios'
import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { EncryptionService } from './core/encryption.service'
import { EncryptionRepository } from './persistence/repository/encryption.repository'

@Module({
  imports: [ConfigModule.forRoot(), HttpModule, PersistenceModule],
  controllers: [],
  providers: [
    EncryptionService,
    EncryptionRepository,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ],
  exports: [EncryptionService]
})
export class EncryptionModule {}
