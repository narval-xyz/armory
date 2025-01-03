import { Injectable } from '@nestjs/common'
import { SeedService } from '../../shared/module/persistence/service/seed.service'
import { ConnectionWithCredentials } from '../core/type/connection.type'
import { ConnectionRepository } from './repository/connection.repository'

@Injectable()
export class ConnectionSeedService extends SeedService {
  constructor(private connectionRepository: ConnectionRepository) {
    super()
  }

  async createConnection(connection: ConnectionWithCredentials) {
    const createdConnection = await this.connectionRepository.create(connection)
    return createdConnection
  }
}
