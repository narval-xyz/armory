import { LoggerService, PaginatedResult, TraceService } from '@narval/nestjs-shared'
import { HttpStatus, NotImplementedException } from '@nestjs/common'
import { Inject, Injectable } from '@nestjs/common/decorators'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { SpanStatusCode } from '@opentelemetry/api'
import { zip } from 'lodash'
import { v4 as uuid } from 'uuid'
import { FindAllOptions, ScopedSyncRepository } from '../../persistence/repository/scoped-sync.repository'
import { OTEL_ATTR_CONNECTION_ID, OTEL_ATTR_CONNECTION_PROVIDER, OTEL_ATTR_SYNC_ID } from '../../shared/constant'
import { ScopedSyncStartedEvent } from '../../shared/event/scoped-sync-started.event'
import { ScopedSyncException } from '../exception/scoped-sync.exception'
import { AnchorageScopedSyncService } from '../provider/anchorage/anchorage-scoped-sync.service'
import { FireblocksScopedSyncService } from '../provider/fireblocks/fireblocks-scoped-sync.service'
import { ConnectionWithCredentials } from '../type/connection.type'
import { Provider, ProviderScopedSyncService } from '../type/provider.type'
import { ConnectionScope } from '../type/scope.type'
import {
  RawAccount,
  RawAccountSyncFailure,
  ScopedSync,
  ScopedSyncResult,
  ScopedSyncStarted,
  ScopedSyncStatus,
  StartScopedSync
} from '../type/scoped-sync.type'
import { AccountService } from './account.service'
import { AddressService } from './address.service'
import { NetworkService } from './network.service'
import { WalletService } from './wallet.service'

@Injectable()
export class ScopedSyncService {
  constructor(
    private readonly scopedSyncRepository: ScopedSyncRepository,
    private readonly anchorageScopedSyncService: AnchorageScopedSyncService,
    private readonly fireblocksScopedSyncService: FireblocksScopedSyncService,
    private readonly walletService: WalletService,
    private readonly accountService: AccountService,
    private readonly addressService: AddressService,
    private readonly networkService: NetworkService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: LoggerService,
    @Inject(TraceService) private readonly traceService: TraceService
  ) {}

  async start(connections: ConnectionWithCredentials[], rawAccounts: RawAccount[]): Promise<ScopedSyncStarted> {
    this.logger.log('Start connections scopedSync', {
      connectionsCount: connections.length,
      connectionIds: connections.map((connectionId) => connectionId)
    })

    const notSyncingConnections: ConnectionWithCredentials[] = []

    for (const connection of connections) {
      const inProgress = await this.scopedSyncRepository.exists({
        connectionId: connection.connectionId,
        clientId: connection.clientId,
        status: ScopedSyncStatus.PROCESSING
      })

      if (inProgress) {
        throw new ScopedSyncException({
          message: 'There is already a Scoped Sync in progress for requested connections',
          suggestedHttpStatusCode: HttpStatus.CONFLICT,
          context: {
            conflictingConnectionId: connection.connectionId
          }
        })
      }

      notSyncingConnections.push(connection)
    }

    if (notSyncingConnections.length) {
      const now = new Date()

      const scopedSyncs = await this.scopedSyncRepository.bulkCreate(
        notSyncingConnections.map(({ connectionId, clientId }) =>
          this.toProcessingScopedSync({
            clientId,
            connectionId,
            createdAt: now,
            scopedSyncId: uuid(),
            rawAccounts
          })
        )
      )

      for (const [scopedSync, connection] of zip(scopedSyncs, notSyncingConnections)) {
        if (scopedSync && connection) {
          // NOTE: Emits an event that will delegate the scopedSync process to
          // another worker, allowing to unblock the request. The event handler
          // will then invoke the `ScopedSyncService.scopedSync` method.
          this.eventEmitter.emit(ScopedSyncStartedEvent.EVENT_NAME, new ScopedSyncStartedEvent(scopedSync, connection))
        }
      }

      return { started: true, scopedSyncs }
    }

    this.logger.log('Skip scopedSync because active connections list is empty')

    return { started: false, scopedSyncs: [] }
  }

  async scopedSync(scopedSync: ScopedSync, connection: ConnectionWithCredentials): Promise<ScopedSync> {
    const { clientId, scopedSyncId } = scopedSync
    const { provider, connectionId } = connection
    const context = {
      clientId,
      scopedSyncId,
      connectionId,
      provider
    }

    this.logger.log('Scoped Sync connection', context)

    const span = this.traceService.startSpan(`${ScopedSyncService.name}.scopedSync`, {
      attributes: {
        [OTEL_ATTR_SYNC_ID]: scopedSyncId,
        [OTEL_ATTR_CONNECTION_ID]: connectionId,
        [OTEL_ATTR_CONNECTION_PROVIDER]: provider
      }
    })

    let result: ScopedSyncResult | null = null

    try {
      const networks = await this.networkService.buildProviderExternalIdIndex(provider)
      const { data: existingAccounts } = await this.accountService.findAll(
        { clientId, connectionId },
        {
          pagination: { disabled: true }
        }
      )

      result = await this.getProviderScopedSyncService(connection.provider).scopeSync({
        rawAccounts: scopedSync.rawAccounts,
        connection,
        networks,
        existingAccounts
      })
    } catch (error) {
      this.logger.error('ScopedSync connection failed', { ...context, error })

      span.recordException(error)
      span.setStatus({ code: SpanStatusCode.ERROR })

      return await this.fail(scopedSync, error, result?.failures || [])
    } finally {
      // The execute method has its own span.
      span.end()
    }

    if (result.failures.length && !result.accounts.length) {
      this.logger.error('ScopedSync connection failed', { ...context, result })
    }

    return await this.execute(scopedSync, result)
  }

  private toProcessingScopedSync(
    input: StartScopedSync & { connectionId: string; createdAt?: Date; scopedSyncId?: string }
  ): ScopedSync {
    return {
      ...input,
      completedAt: undefined,
      connectionId: input.connectionId,
      createdAt: input.createdAt || new Date(),
      status: ScopedSyncStatus.PROCESSING,
      scopedSyncId: input.scopedSyncId || uuid(),
      rawAccounts: input.rawAccounts
    }
  }

  async findAll(scope: ConnectionScope, options?: FindAllOptions): Promise<PaginatedResult<ScopedSync>> {
    return this.scopedSyncRepository.findAll(scope, options)
  }

  async findById(scope: ConnectionScope, scopedSyncId: string): Promise<ScopedSync> {
    return this.scopedSyncRepository.findById(scope, scopedSyncId)
  }

  // TODO: pessimist lock if there's already a scopedSync in process for the given
  async execute(scopedSync: ScopedSync, result: ScopedSyncResult): Promise<ScopedSync> {
    const { scopedSyncId } = scopedSync

    const span = this.traceService.startSpan(`${ScopedSyncService.name}.execute`, {
      attributes: { [OTEL_ATTR_SYNC_ID]: scopedSyncId }
    })

    const { wallets, accounts, addresses, failures } = result

    this.logger.log('Raw Account synchronization failures', {
      scopedSyncId,
      failuresCount: failures?.length,
      failures
    })

    this.logger.log('Raw Account synchronization successes', {
      wallets: wallets.length,
      accounts: accounts.length,
      addresses: addresses.length
    })

    try {
      await this.walletService.bulkUpsert(wallets)
      await this.accountService.bulkUpsert(accounts)
      await this.addressService.bulkCreate(addresses)

      const totalItems = result.wallets.length + result.accounts.length + result.addresses.length
      if (totalItems === 0) {
        throw new ScopedSyncException({
          message: 'No raw account was successfully mapped',
          suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          context: { failures: result.failures }
        })
      }

      return await this.complete(scopedSync, result)
    } catch (error) {
      return await this.fail(scopedSync, error, result.failures)
    } finally {
      span.end()
    }
  }

  async complete(scopedSync: ScopedSync, result: ScopedSyncResult): Promise<ScopedSync> {
    const { clientId, scopedSyncId } = scopedSync

    const totalItems = result.wallets.length + result.accounts.length + result.addresses.length
    const hasSuccesses = totalItems > 0
    const hasFailures = result.failures.length > 0

    const status = hasSuccesses && hasFailures ? ScopedSyncStatus.PARTIAL_SUCCESS : ScopedSyncStatus.SUCCESS

    if (status === ScopedSyncStatus.PARTIAL_SUCCESS) {
      return await this.partialSuccess(scopedSync, result.failures)
    }

    this.logger.log('Scoped Sync completed successfuly', { clientId, scopedSyncId })

    const span = this.traceService.startSpan(`${ScopedSyncService.name}.complete`, {
      attributes: { [OTEL_ATTR_SYNC_ID]: scopedSyncId }
    })

    const completedScopedSync = {
      ...scopedSync,
      status,
      completedAt: scopedSync.completedAt || new Date(),
      failures: []
    }

    await this.scopedSyncRepository.update(completedScopedSync)

    span.end()

    return completedScopedSync
  }

  async partialSuccess(scopedSync: ScopedSync, failures: RawAccountSyncFailure[]): Promise<ScopedSync> {
    const { clientId, scopedSyncId } = scopedSync

    this.logger.log('Scoped Sync partially successful', { clientId, scopedSyncId })

    const span = this.traceService.startSpan(`${ScopedSyncService.name}.partial_success`, {
      attributes: { [OTEL_ATTR_SYNC_ID]: scopedSyncId }
    })

    const completedScopedSync = {
      ...scopedSync,
      status: ScopedSyncStatus.PARTIAL_SUCCESS,
      completedAt: scopedSync.completedAt || new Date(),
      failures
    }

    await this.scopedSyncRepository.update(completedScopedSync)

    span.end()

    return completedScopedSync
  }

  async fail(scopedSync: ScopedSync, error: Error, failures: RawAccountSyncFailure[]): Promise<ScopedSync> {
    const { clientId, scopedSyncId } = scopedSync

    this.logger.log('Scoped Sync fail', { clientId, scopedSyncId, error })

    const span = this.traceService.startSpan(`${ScopedSyncService.name}.fail`, {
      attributes: { [OTEL_ATTR_SYNC_ID]: scopedSyncId }
    })

    span.recordException(error)
    span.setStatus({ code: SpanStatusCode.ERROR })

    const failedScopedSync = {
      ...scopedSync,
      status: ScopedSyncStatus.FAILED,
      error: {
        name: error.name,
        message: error.message,
        traceId: this.traceService.getActiveSpan()?.spanContext().traceId
      },
      completedAt: scopedSync.completedAt || new Date(),
      failures
    }

    await this.scopedSyncRepository.update(failedScopedSync)

    span.end()

    return failedScopedSync
  }

  private getProviderScopedSyncService(provider: Provider): ProviderScopedSyncService {
    switch (provider) {
      case Provider.ANCHORAGE:
        return this.anchorageScopedSyncService
      case Provider.FIREBLOCKS:
        return this.fireblocksScopedSyncService
      default:
        throw new NotImplementedException(`Unsupported Scoped Sync for provider ${provider}`)
    }
  }
}
