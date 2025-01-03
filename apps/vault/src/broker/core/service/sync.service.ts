import { LoggerService, PaginatedResult, TraceService } from '@narval/nestjs-shared'
import { NotImplementedException } from '@nestjs/common'
import { Inject, Injectable } from '@nestjs/common/decorators'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { SpanStatusCode } from '@opentelemetry/api'
import { zip } from 'lodash'
import { v4 as uuid } from 'uuid'
import { FindAllOptions, SyncRepository } from '../../persistence/repository/sync.repository'
import { OTEL_ATTR_CONNECTION_ID, OTEL_ATTR_CONNECTION_PROVIDER, OTEL_ATTR_SYNC_ID } from '../../shared/constant'
import { SyncStartedEvent } from '../../shared/event/sync-started.event'
import { AnchorageSyncService } from '../provider/anchorage/anchorage-sync.service'
import { ConnectionWithCredentials } from '../type/connection.type'
import {
  Provider,
  ProviderSyncService,
  SyncResult,
  isCreateOperation,
  isDeleteOperation,
  isFailedOperation,
  isUpdateOperation
} from '../type/provider.type'
import { StartSync, Sync, SyncStarted, SyncStatus } from '../type/sync.type'
import { AccountService } from './account.service'
import { AddressService } from './address.service'
import { KnownDestinationService } from './known-destination.service'
import { WalletService } from './wallet.service'

@Injectable()
export class SyncService {
  constructor(
    private readonly syncRepository: SyncRepository,
    private readonly anchorageSyncService: AnchorageSyncService,
    private readonly walletService: WalletService,
    private readonly accountService: AccountService,
    private readonly addressService: AddressService,
    private readonly knownDestinationService: KnownDestinationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: LoggerService,
    @Inject(TraceService) private readonly traceService: TraceService
  ) {}

  async start(connections: ConnectionWithCredentials[]): Promise<SyncStarted> {
    this.logger.log('Start connections sync', {
      connectionsCount: connections.length,
      connectionIds: connections.map((connectionId) => connectionId)
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

      for (const [sync, connection] of zip(syncs, connections)) {
        if (sync && connection) {
          // NOTE: Emits an event that will delegate the sync process to
          // another worker, allowing to unblock the request. The event handler
          // will then invoke the `SyncService.sync` method.
          this.eventEmitter.emit(SyncStartedEvent.EVENT_NAME, new SyncStartedEvent(sync, connection))
        }
      }

      return { started: true, syncs }
    }

    this.logger.log('Skip sync because active connections list is empty')

    return { started: false, syncs: [] }
  }

  async sync(sync: Sync, connection: ConnectionWithCredentials): Promise<Sync> {
    const { clientId, syncId } = sync
    const { provider, connectionId } = connection
    const context = {
      clientId,
      syncId,
      connectionId,
      provider
    }

    this.logger.log('Sync connection', context)

    const span = this.traceService.startSpan(`${SyncService.name}.sync`, {
      attributes: {
        [OTEL_ATTR_SYNC_ID]: syncId,
        [OTEL_ATTR_CONNECTION_ID]: connectionId,
        [OTEL_ATTR_CONNECTION_PROVIDER]: provider
      }
    })

    let result: SyncResult | null = null

    // Ensure the sync status is updated on failures. The `execute` method is
    // not wrapped in the try/catch block because it already handles errors
    // internally.
    try {
      result = await this.getProviderSyncService(connection.provider).sync(connection)
    } catch (error) {
      this.logger.error('Sync connection failed', { ...context, error })

      span.recordException(error)
      span.setStatus({ code: SpanStatusCode.ERROR })

      return await this.fail(sync, error)
    } finally {
      // The execute method has its own span.
      span.end()
    }

    if (result) {
      return await this.execute(sync, result)
    }

    return sync
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

  async findAll(clientId: string, options?: FindAllOptions): Promise<PaginatedResult<Sync>> {
    return this.syncRepository.findAll(clientId, options)
  }

  async findById(clientId: string, syncId: string): Promise<Sync> {
    return this.syncRepository.findById(clientId, syncId)
  }

  // TODO: pessimist lock if there's already a sync in process for the given
  // connection.
  async execute(sync: Sync, result: SyncResult): Promise<Sync> {
    // IMPORTANT: Thoroughly test the execution in the integration test
    // `sync.service.spec.ts`.

    const { clientId, syncId } = sync

    const span = this.traceService.startSpan(`${SyncService.name}.execute`, {
      attributes: { [OTEL_ATTR_SYNC_ID]: syncId }
    })

    const walletCreateOperations = result.wallets.filter(isCreateOperation).map(({ create }) => create)
    const walletUpdateOperations = result.wallets.filter(isUpdateOperation).map(({ update }) => update)
    const walletDeleteOperations = result.wallets.filter(isDeleteOperation).map(({ entityId }) => entityId)
    const walletFailedOperations = result.wallets.filter(isFailedOperation)

    const accountCreateOperations = result.accounts.filter(isCreateOperation).map(({ create }) => create)
    const accountUpdateOperations = result.accounts.filter(isUpdateOperation).map(({ update }) => update)
    const accountDeleteOperations = result.accounts.filter(isDeleteOperation).map(({ entityId }) => entityId)
    const accountFailedOperations = result.accounts.filter(isFailedOperation)

    const addressCreateOperations = result.addresses.filter(isCreateOperation).map(({ create }) => create)
    const addressUpdateOperations = result.addresses.filter(isUpdateOperation).map(({ update }) => update)
    const addressDeleteOperations = result.addresses.filter(isDeleteOperation).map(({ entityId }) => entityId)
    const addressFailedOperations = result.addresses.filter(isFailedOperation)

    const knownDestinationCreateOperations = result.knownDestinations
      .filter(isCreateOperation)
      .map(({ create }) => create)
    const knownDestinationUpdateOperations = result.knownDestinations
      .filter(isUpdateOperation)
      .map(({ update }) => update)
    const knownDestinationDeleteOperations = result.knownDestinations
      .filter(isDeleteOperation)
      .map(({ entityId }) => entityId)
    const knownDestinationFailedOperations = result.knownDestinations.filter(isFailedOperation)

    this.logger.log('Execute sync operations', {
      clientId,
      syncId,
      operations: {
        wallet: {
          create: walletCreateOperations.length,
          update: walletUpdateOperations.length,
          delete: walletDeleteOperations.length,
          failed: walletFailedOperations.length
        },
        account: {
          create: accountCreateOperations.length,
          update: accountUpdateOperations.length,
          delete: accountDeleteOperations.length,
          failed: accountFailedOperations.length
        },
        address: {
          create: addressCreateOperations.length,
          update: addressUpdateOperations.length,
          delete: addressDeleteOperations.length,
          failed: addressFailedOperations.length
        },
        knownDestination: {
          create: knownDestinationCreateOperations.length,
          update: knownDestinationUpdateOperations.length,
          delete: knownDestinationDeleteOperations.length,
          failed: knownDestinationFailedOperations.length
        }
      }
    })

    if (walletFailedOperations.length) {
      this.logger.warn('Sync operations contains failures for wallets', {
        operations: walletFailedOperations
      })
    }

    if (accountFailedOperations.length) {
      this.logger.warn('Sync operations contains failures for accounts', {
        operations: accountFailedOperations
      })
    }

    if (addressFailedOperations.length) {
      this.logger.warn('Sync operations contains failures for addresses', {
        operations: addressFailedOperations
      })
    }

    if (knownDestinationFailedOperations.length) {
      this.logger.warn('Sync operations contains failures for known destinations', {
        operations: knownDestinationFailedOperations
      })
    }

    try {
      this.logger.log('Execute wallet create operations', { syncId, clientId })
      await this.walletService.bulkCreate(walletCreateOperations)

      this.logger.log('Execute wallet update operations', { syncId, clientId })
      await this.walletService.bulkUpdate(walletUpdateOperations)

      this.logger.log('Execute account create operations', { syncId, clientId })
      await this.accountService.bulkCreate(accountCreateOperations)
      this.logger.log('Execute account update operations', { syncId, clientId })
      await this.accountService.bulkUpdate(accountUpdateOperations)

      // TODO: address update
      this.logger.log('Execute address create operations', { syncId, clientId })
      await this.addressService.bulkCreate(addressCreateOperations)

      this.logger.log('Execute known destination create operations', { syncId, clientId })
      await this.knownDestinationService.bulkCreate(knownDestinationCreateOperations)

      this.logger.log('Execute known destination update operations', { syncId, clientId })
      await this.knownDestinationService.bulkUpdate(knownDestinationUpdateOperations)

      this.logger.log('Execute known destination delete operations', { syncId, clientId })
      await this.knownDestinationService.bulkDelete(knownDestinationDeleteOperations)

      return await this.complete(sync)
    } catch (error) {
      return await this.fail(sync, error)
    } finally {
      span.end()
    }
  }

  async complete(sync: Sync): Promise<Sync> {
    const { clientId, syncId } = sync

    this.logger.log('Sync complete', { clientId, syncId })

    const span = this.traceService.startSpan(`${SyncService.name}.complete`, {
      attributes: { [OTEL_ATTR_SYNC_ID]: syncId }
    })

    const completedSync = {
      ...sync,
      status: SyncStatus.SUCCESS,
      completedAt: sync.completedAt || new Date()
    }

    await this.syncRepository.update(completedSync)

    span.end()

    return completedSync
  }

  async fail(sync: Sync, error: Error): Promise<Sync> {
    const { clientId, syncId } = sync

    this.logger.log('Sync fail', { clientId, syncId, error })

    const span = this.traceService.startSpan(`${SyncService.name}.fail`, {
      attributes: { [OTEL_ATTR_SYNC_ID]: syncId }
    })

    span.recordException(error)
    span.setStatus({ code: SpanStatusCode.ERROR })

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

    span.end()

    return failedSync
  }

  private getProviderSyncService(provider: Provider): ProviderSyncService {
    switch (provider) {
      case Provider.ANCHORAGE:
        return this.anchorageSyncService
      default:
        throw new NotImplementedException(`Unsupported sync for provider ${provider}`)
    }
  }
}
