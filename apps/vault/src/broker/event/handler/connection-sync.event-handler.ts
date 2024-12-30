import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { SyncService } from '../../core/service/sync.service'
import { ConnectionActivatedEvent } from '../../shared/event/connection-activated.event'
import { SyncStartedEvent } from '../../shared/event/sync-started.event'

@Injectable()
export class ConnectionSyncEventHandler {
  constructor(
    private readonly syncService: SyncService,
    private readonly logger: LoggerService
  ) {}

  @OnEvent(ConnectionActivatedEvent.EVENT_NAME)
  async handleConnectionActivatedEvent(event: ConnectionActivatedEvent) {
    this.logger.log(`Received ${ConnectionActivatedEvent.EVENT_NAME} event`, {
      clientId: event.connection.clientId,
      connectionId: event.connection.connectionId
    })

    await this.syncService.start([event.connection])
  }

  @OnEvent(SyncStartedEvent.EVENT_NAME)
  async handleSyncStarted(event: SyncStartedEvent) {
    this.logger.log(`Received ${SyncStartedEvent.EVENT_NAME} event`, {
      clientId: event.connection.clientId,
      connectionId: event.connection.connectionId
    })

    await this.syncService.sync(event.sync, event.connection)
  }
}
