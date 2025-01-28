import { LoggerService, PaginatedResult, TraceService } from '@narval/nestjs-shared'
import { NotImplementedException } from '@nestjs/common'
import { Inject, Injectable } from '@nestjs/common/decorators'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { SpanStatusCode } from '@opentelemetry/api'
import { zip } from 'lodash'
import { v4 as uuid } from 'uuid'
import { FindAllOptions, ScopedSyncRepository } from '../../persistence/repository/scoped-sync.repository'
import { OTEL_ATTR_CONNECTION_ID, OTEL_ATTR_CONNECTION_PROVIDER, OTEL_ATTR_SYNC_ID } from '../../shared/constant'
import { ScopedSyncStartedEvent } from '../../shared/event/scoped-sync-started.event'
import { AnchorageScopedSyncService } from '../provider/anchorage/anchorage-scoped-sync.service'
import { FireblocksScopedSyncService } from '../provider/fireblocks/fireblocks-scoped-sync.service'
import { ConnectionWithCredentials } from '../type/connection.type'
import {
  Provider,
  ProviderScopedSyncService,
  ScopedSyncResult,
  isCreateOperation,
  isFailedOperation,
  isUpdateOperation
} from '../type/provider.type'
import { ConnectionScope } from '../type/scope.type'
import { RawAccount, ScopedSync, ScopedSyncStarted, ScopedSyncStatus, StartScopedSync } from '../type/scoped-sync.type'
import { AccountService } from './account.service'
import { AddressService } from './address.service'
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
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: LoggerService,
    @Inject(TraceService) private readonly traceService: TraceService
  ) {}

  async start(connections: ConnectionWithCredentials[], rawAccounts: RawAccount[]): Promise<ScopedSyncStarted> {
    this.logger.log('Start connections scoped sync', {
      connectionsCount: connections.length,
      connectionIds: connections.map((connectionId) => connectionId),
      rawAccounts: rawAccounts.map(({ provider, externalId }) => ({ provider, externalId }))
    })

    if (connections.length) {
      const now = new Date()

      const scopedSyncs = await this.scopedSyncRepository.bulkCreate(
        connections.map(({ connectionId, clientId }) =>
          this.toProcessingScopedSync({
            clientId,
            connectionId,
            createdAt: now,
            scopedSyncId: uuid(),
            rawAccounts
          })
        )
      )

      for (const [scopedSync, connection] of zip(scopedSyncs, connections)) {
        if (scopedSync && connection) {
          // NOTE: Emits an event that will delegate the scopedSync process to
          // another worker, allowing to unblock the request. The event handler
          // will then invoke the `ScopedSyncService.scopedSync` method.
          this.eventEmitter.emit(ScopedSyncStartedEvent.EVENT_NAME, new ScopedSyncStartedEvent(scopedSync, connection))
        }
      }

      return { started: true, scopedSyncs }
    }

    this.logger.log('Skip scoped sync because active connections list is empty')

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

    this.logger.log('Scoped sync connection', context)

    const span = this.traceService.startSpan(`${ScopedSyncService.name}.scopedSync`, {
      attributes: {
        [OTEL_ATTR_SYNC_ID]: scopedSyncId,
        [OTEL_ATTR_CONNECTION_ID]: connectionId,
        [OTEL_ATTR_CONNECTION_PROVIDER]: provider
      }
    })

    let result: ScopedSyncResult | null = null

    // Ensure the scopedSync status is updated on failures. The `execute` method is
    // not wrapped in the try/catch block because it already handles errors
    // internally.
    try {
      result = await this.getProviderScopedSyncService(connection.provider).scopedSync(
        connection,
        scopedSync.rawAccounts
      )
    } catch (error) {
      this.logger.error('Scoped sync connection failed', { ...context, error })

      span.recordException(error)
      span.setStatus({ code: SpanStatusCode.ERROR })

      return await this.fail(scopedSync, error)
    } finally {
      // The execute method has its own span.
      span.end()
    }

    if (result) {
      return await this.execute(scopedSync, result)
    }

    return scopedSync
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
  // connection.
  async execute(scopedSync: ScopedSync, result: ScopedSyncResult): Promise<ScopedSync> {
    // IMPORTANT: Thoroughly test the execution in the integration test
    // `scopedSync.service.spec.ts`.

    const { clientId, scopedSyncId } = scopedSync

    const span = this.traceService.startSpan(`${ScopedSyncService.name}.execute`, {
      attributes: { [OTEL_ATTR_SYNC_ID]: scopedSyncId }
    })

    const walletCreateOperations = result.wallets.filter(isCreateOperation).map(({ create }) => create)
    const walletUpdateOperations = result.wallets.filter(isUpdateOperation).map(({ update }) => update)
    const walletFailedOperations = result.wallets.filter(isFailedOperation)

    const accountCreateOperations = result.accounts.filter(isCreateOperation).map(({ create }) => create)
    const accountUpdateOperations = result.accounts.filter(isUpdateOperation).map(({ update }) => update)
    const accountFailedOperations = result.accounts.filter(isFailedOperation)

    const addressCreateOperations = result.addresses.filter(isCreateOperation).map(({ create }) => create)
    const addressFailedOperations = result.addresses.filter(isFailedOperation)

    this.logger.log('Execute scoped sync operations', {
      clientId,
      scopedSyncId,
      operations: {
        wallet: {
          create: walletCreateOperations.length,
          update: walletUpdateOperations.length,
          failed: walletFailedOperations.length
        },
        account: {
          create: accountCreateOperations.length,
          update: accountUpdateOperations.length,
          failed: accountFailedOperations.length
        },
        address: {
          create: addressCreateOperations.length,
          failed: addressFailedOperations.length
        }
      }
    })

    if (walletFailedOperations.length) {
      this.logger.error('Scoped sync operations contains failures for wallets', {
        operations: walletFailedOperations
      })
    }

    if (accountFailedOperations.length) {
      this.logger.error('Scoped sync operations contains failures for accounts', {
        operations: accountFailedOperations
      })
    }

    if (addressFailedOperations.length) {
      this.logger.error('Scoped sync operations contains failures for addresses', {
        operations: addressFailedOperations
      })
    }

    try {
      this.logger.log('Execute wallet create operations', { scopedSyncId, clientId })
      await this.walletService.bulkCreate(walletCreateOperations)
      this.logger.log('Execute wallet update operations', { scopedSyncId, clientId })
      await this.walletService.bulkUpdate(walletUpdateOperations)

      this.logger.log('Execute account create operations', { scopedSyncId, clientId })
      await this.accountService.bulkCreate(accountCreateOperations)
      this.logger.log('Execute account update operations', { scopedSyncId, clientId })
      await this.accountService.bulkUpdate(accountUpdateOperations)

      // TODO: address update
      this.logger.log('Execute address create operations', { scopedSyncId, clientId })
      await this.addressService.bulkCreate(addressCreateOperations)

      return await this.complete(scopedSync)
    } catch (error) {
      return await this.fail(scopedSync, error)
    } finally {
      span.end()
    }
  }

  async complete(scopedSync: ScopedSync): Promise<ScopedSync> {
    const { clientId, scopedSyncId } = scopedSync

    this.logger.log('Scoped sync complete', { clientId, scopedSyncId })

    const span = this.traceService.startSpan(`${ScopedSyncService.name}.complete`, {
      attributes: { [OTEL_ATTR_SYNC_ID]: scopedSyncId }
    })

    const completedScopedSync = {
      ...scopedSync,
      status: ScopedSyncStatus.SUCCESS,
      completedAt: scopedSync.completedAt || new Date()
    }

    await this.scopedSyncRepository.update(completedScopedSync)

    span.end()

    return completedScopedSync
  }

  async fail(scopedSync: ScopedSync, error: Error): Promise<ScopedSync> {
    const { clientId, scopedSyncId } = scopedSync

    this.logger.log('Scoped sync fail', { clientId, scopedSyncId, error })

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
      completedAt: scopedSync.completedAt || new Date()
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
        throw new NotImplementedException(`Unsupported scoped sync for provider ${provider}`)
    }
  }
}
