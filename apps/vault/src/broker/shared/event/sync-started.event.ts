import { ConnectionWithCredentials } from '../../core/type/connection.type'
import { Sync } from '../../core/type/sync.type'

export class SyncStartedEvent {
  static EVENT_NAME = 'sync.started'

  constructor(
    public readonly sync: Sync,
    public readonly connection: ConnectionWithCredentials
  ) {}
}
