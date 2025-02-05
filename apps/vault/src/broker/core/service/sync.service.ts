import { PaginatedResult } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common/decorators'
import { FindAllOptions, SyncRepository } from '../../persistence/repository/sync.repository'
import { ConnectionScope } from '../type/scope.type'
import { Sync } from '../type/sync.type'

@Injectable()
export class SyncService {
  constructor(private readonly syncRepository: SyncRepository) {}
  async findAll(scope: ConnectionScope, options?: FindAllOptions): Promise<PaginatedResult<Sync>> {
    return this.syncRepository.findAll(scope, options)
  }

  async findById(scope: ConnectionScope, syncId: string): Promise<Sync> {
    return this.syncRepository.findById(scope, syncId)
  }
}
