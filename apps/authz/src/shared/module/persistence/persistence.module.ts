import { Module } from '@nestjs/common'
import { PersistenceRepository } from './persistence.repository'

@Module({
  exports: [PersistenceRepository],
  providers: [PersistenceRepository]
})
export class PersistenceModule {}
