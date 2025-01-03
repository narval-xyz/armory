import { hexSchema } from '@narval/policy-engine-shared'
import { privateKeyToJwk } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { ed25519PublicKeySchema } from 'packages/signature/src/lib/schemas'
import { SeedService } from '../../shared/module/persistence/service/seed.service'
import { ConnectionWithCredentials } from '../core/type/connection.type'
import { ConnectionRepository } from './repository/connection.repository'

const NARVAL_DEV_CLIENT = 'narval-dev-client'

@Injectable()
export class ConnectionSeedService extends SeedService {
  constructor(private connectionRepository: ConnectionRepository) {
    super()
  }

  async createConnection(connection: ConnectionWithCredentials) {
    const createdConnection = await this.connectionRepository.create(connection)
    return createdConnection
  }

  async createNarvalDevConnection() {
    if (process.env.ANCHORAGE_API_KEY && process.env.ANCHORAGE_SECRET_KEY) {
      const privateKey = privateKeyToJwk(hexSchema.parse(process.env.ANCHORAGE_SECRET_KEY), 'EDDSA')
      const publicKey = ed25519PublicKeySchema.parse(privateKey)
      await this.connectionRepository.create({
        clientId: NARVAL_DEV_CLIENT,
        connectionId: '13198cdc-e508-4be5-9a5e-141a1a6e3526',
        credentials: {
          apiKey: process.env.ANCHORAGE_API_KEY,
          privateKey,
          publicKey
        },
        label: 'Anchorage Staging - Narval Dev Client',
        provider: 'anchorage',
        url: 'https://api.anchorage-staging.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      })
    }
  }
}
