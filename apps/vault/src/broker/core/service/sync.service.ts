import { LoggerService, PaginatedResult, TraceService } from '@narval/nestjs-shared'
import { Inject, Injectable } from '@nestjs/common/decorators'
import { v4 as uuid } from 'uuid'
import { FindAllPaginatedOptions, SyncRepository } from '../../persistence/repository/sync.repository'
import { ActiveConnectionWithCredentials } from '../type/connection.type'
import { StartSync, Sync, SyncStarted, SyncStatus } from '../type/sync.type'
import { AnchorageSyncService } from './anchorage-sync.service'

@Injectable()
export class SyncService {
  constructor(
    private readonly syncRepository: SyncRepository,
    private readonly anchorageSyncService: AnchorageSyncService,
    private readonly logger: LoggerService,
    @Inject(TraceService) private readonly traceService: TraceService
  ) {}

  async start(connections: ActiveConnectionWithCredentials[]): Promise<SyncStarted> {
    this.logger.log('Start connections sync', {
      count: connections.length,
      ids: connections.map((connectionId) => connectionId)
    })

    if (connections.length) {
      const now = new Date()

      const syncs = await this.syncRepository.bulkCreate(
        connections.map(({ connectionId, clientId }) =>
          this.toProcessingSync({
            clientId,
            connectionId,
            createdAt: now,
            syncId: uuid()
          })
        )
      )

      await Promise.allSettled(
        connections.map(async (connection) => {
          this.anchorageSyncService.sync(connection)
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

    this.logger.log('Skip sync because active connections list is empty')

    return { started: false, syncs: [] }
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
