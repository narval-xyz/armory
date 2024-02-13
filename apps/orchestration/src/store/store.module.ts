import { Module } from '@nestjs/common'
import { EntityStoreModule } from './entity/entity-store.module'

@Module({
  imports: [EntityStoreModule]
})
export class StoreModule {}
