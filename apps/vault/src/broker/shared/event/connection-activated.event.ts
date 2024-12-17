import { ActiveConnectionWithCredentials } from '../../core/type/connection.type'

export class ConnectionActivatedEvent {
  static EVENT_NAME = 'connection.activated'

  constructor(public readonly connection: ActiveConnectionWithCredentials) {}
}
