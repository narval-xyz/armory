import { ConnectionWithCredentials } from '../../core/type/connection.type'
import { ScopedSync } from '../../core/type/scoped-sync.type'

export class ScopedSyncStartedEvent {
  static EVENT_NAME = 'scoped.sync.started'

  constructor(
    public readonly sync: ScopedSync,
    public readonly connection: ConnectionWithCredentials
  ) {}
}
