import { HttpModule } from '@nestjs/axios'
import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_PIPE } from '@nestjs/core'
import { KeyringRepository } from '../keyring/persistence/repository/keyring.repository'
import { PersistenceModule } from '../shared/module/persistence/persistence.module'
import { KeyringService } from './core/keyring.service'

@Module({
  imports: [ConfigModule.forRoot(), HttpModule, PersistenceModule],
  controllers: [],
  providers: [
    KeyringService,
    KeyringRepository,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class KeyringModule {}
