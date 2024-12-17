import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { SyncService } from '../../core/service/sync.service'
import { ConnectionActivatedEvent } from '../../shared/event/connection-activated.event'

@Injectable()
export class ConnectionSyncEventHandler {
  constructor(
    private readonly syncService: SyncService,
    private readonly logger: LoggerService
  ) {}

  @OnEvent(ConnectionActivatedEvent.EVENT_NAME)
  async handleConnectionActivatedEvent(event: ConnectionActivatedEvent) {
    this.logger.log('Received connection.activated event', {
      clientId: event.connection.clientId,
      connectionId: event.connection.connectionId
    })

    await this.syncService.start([event.connection])
  }
}
