import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ScopedSyncService } from '../../core/service/scoped-sync.service'
import { ScopedSyncStartedEvent } from '../../shared/event/scoped-sync-started.event'

@Injectable()
export class ConnectionScopedSyncEventHandler {
  constructor(
    private readonly scopedSyncService: ScopedSyncService,
    private readonly logger: LoggerService
  ) {}

  @OnEvent(ScopedSyncStartedEvent.EVENT_NAME)
  async handleSyncStarted(event: ScopedSyncStartedEvent) {
    this.logger.log(`Received ${ScopedSyncStartedEvent.EVENT_NAME} event`, {
      clientId: event.connection.clientId,
      connectionId: event.connection.connectionId,
      rawAccounts: event.sync.rawAccounts
    })

    await this.scopedSyncService.scopedSync(event.sync, event.connection)
  }
}
