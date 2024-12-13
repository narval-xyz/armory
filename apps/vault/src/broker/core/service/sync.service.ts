import { PaginatedResult } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common/decorators'
import { v4 as uuid } from 'uuid'
import { FindAllPaginatedOptions, SyncRepository } from '../../persistence/repository/sync.repository'
import { ConnectionStatus } from '../type/connection.type'
import { StartSync, Sync, SyncStatus } from '../type/sync.type'
import { ConnectionService } from './connection.service'

@Injectable()
export class SyncService {
  constructor(
    private readonly syncRepository: SyncRepository,
    private readonly connectionService: ConnectionService
  ) {}

  async start(input: StartSync): Promise<{
    started: boolean
    syncs: Sync[]
  }> {
    const now = new Date()

    if (input.connectionId) {
      const syncId = uuid()
      const sync = await this.syncRepository.create(
        this.toProcessingSync({
          ...input,
          connectionId: input.connectionId,
          createdAt: now,
          syncId
        })
      )

      // TODO: (@wcalderipe, 10/12/24): Sync connection

      return { started: true, syncs: [sync] }
    }

    const connections = await this.connectionService.findAll(input.clientId, {
      filters: {
        status: ConnectionStatus.ACTIVE
      }
    })

    const syncs = await this.syncRepository.bulkCreate(
      connections.map(({ connectionId }) =>
        this.toProcessingSync({
          ...input,
          connectionId,
          createdAt: now,
          syncId: uuid()
        })
      )
    )

    // TODO: (@wcalderipe, 10/12/24): Sync connections

    return { started: true, syncs }
  }

  private toProcessingSync(input: StartSync & { connectionId: string; createdAt?: Date; syncId?: string }): Sync {
    return {
      ...input,
      completedAt: undefined,
      connectionId: input.connectionId,
      createdAt: input.createdAt || new Date(),
      status: SyncStatus.PROCESSING,
      syncId: input.syncId || uuid()
    }
  }

  async findAllPaginated(clientId: string, options?: FindAllPaginatedOptions): Promise<PaginatedResult<Sync>> {
    return this.syncRepository.findAllPaginated(clientId, options)
  }

  async findById(clientId: string, syncId: string): Promise<Sync> {
    return this.syncRepository.findById(clientId, syncId)
  }
}
