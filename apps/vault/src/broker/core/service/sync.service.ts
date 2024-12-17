import { PaginatedResult, TraceService } from '@narval/nestjs-shared'
import { Inject, Injectable } from '@nestjs/common/decorators'
import { v4 as uuid } from 'uuid'
import { FindAllPaginatedOptions, SyncRepository } from '../../persistence/repository/sync.repository'
import { ActiveConnectionWithCredentials, ConnectionStatus, isActiveConnection } from '../type/connection.type'
import { StartSync, Sync, SyncStatus } from '../type/sync.type'
import { AnchorageSyncService } from './anchorage-sync.service'
import { ConnectionService } from './connection.service'

@Injectable()
export class SyncService {
  constructor(
    private readonly syncRepository: SyncRepository,
    private readonly connectionService: ConnectionService,
    private readonly anchorageSyncService: AnchorageSyncService,
    @Inject(TraceService) private readonly traceService: TraceService
  ) {}

  async start(input: StartSync): Promise<{
    started: boolean
    syncs: Sync[]
  }> {
    const now = new Date()

    if (input.connectionId) {
      const syncId = uuid()
      const connection = await this.connectionService.findById(input.clientId, input.connectionId, true)

      const sync = await this.syncRepository.create(
        this.toProcessingSync({
          ...input,
          connectionId: connection.connectionId,
          createdAt: now,
          syncId
        })
      )

      if (isActiveConnection(connection)) {
        this.anchorageSyncService
          .sync(connection)
          .then(async () => {
            await this.complete(sync)
          })
          .catch(async (error) => {
            await this.fail(sync, error)
          })

        return { started: true, syncs: [sync] }
      }

      return { started: false, syncs: [] }
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

    await Promise.allSettled(
      connections.map(async (connection) => {
        const connectionWithCredentials = await this.connectionService.findById(
          input.clientId,
          connection.connectionId,
          true
        )
        this.anchorageSyncService.sync(connectionWithCredentials as ActiveConnectionWithCredentials)
      })
    )
      .then(async () => {
        await Promise.all(syncs.map((sync) => this.complete(sync)))
      })
      .catch(async (error) => {
        await Promise.all(syncs.map((sync) => this.fail(sync, error)))
      })

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

  async complete(sync: Sync): Promise<Sync> {
    const completedSync = {
      ...sync,
      status: SyncStatus.SUCCESS,
      completedAt: sync.completedAt || new Date()
    }

    await this.syncRepository.update(completedSync)

    return completedSync
  }

  async fail(sync: Sync, error: Error): Promise<Sync> {
    const failedSync = {
      ...sync,
      status: SyncStatus.FAILED,
      error: {
        name: error.name,
        message: error.message,
        traceId: this.traceService.getActiveSpan()?.spanContext().traceId
      },
      completedAt: sync.completedAt || new Date()
    }

    await this.syncRepository.update(failedSync)

    return failedSync
  }
}
