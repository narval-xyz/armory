import { Module } from '@nestjs/common'
import { KeyValueRepository } from './core/repository/key-value.repository'
import { KeyValueService } from './core/service/key-value.service'
import { InMemoryKeyValueRepository } from './persistence/repository/in-memory-key-value.repository'

@Module({
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
