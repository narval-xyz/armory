import { ConfigService } from '@narval/config-module'
import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { Config } from '../../../policy-engine.config'
import { Client } from '../../../shared/type/domain.type'
import { ClientService } from './client.service'

@Injectable()
export class BootstrapService {
  constructor(
    private configService: ConfigService<Config>,
    private clientService: ClientService,
    private logger: LoggerService
  ) {}

  async boot(): Promise<void> {
    this.logger.log('Start bootstrap')

    await this.persistDeclarativeClients()

    await this.syncClients()

    // TEMPORARY: Migrate the key-value format of the Client config into the table format.
    // Can be removed once this runs once.
    await this.clientService.migrateV1Data()

    this.logger.log('Bootstrap end')
  }

  private async persistDeclarativeClients(): Promise<void> {
    const clients = this.configService.get('clients')
    if (!clients) return

    // Given ClientConfig type, build the Client type
    const declarativeClients: Client[] = clients.map((client) => ({
      clientId: client.clientId,
      name: client.name,
      configurationSource: 'declarative',
      baseUrl: client.baseUrl,
      auth: {
        disabled: client.auth.disabled,
        local: client.auth.local?.clientSecret
          ? {
              clientSecret: client.auth.local?.clientSecret
            }
          : null
      },
      dataStore: {
        entity: {
          data: {
            type: 'HTTP',
            url: client.dataStore.entity.data.url
          },
          signature: {
            type: 'HTTP',
            url: client.dataStore.entity.signature.url
          },
          keys: client.dataStore.entity.publicKeys
        },
        policy: {
          data: {
            type: 'HTTP',
            url: client.dataStore.policy.data.url
          },
          signature: {
            type: 'HTTP',
            url: client.dataStore.policy.signature.url
          },
          keys: client.dataStore.policy.publicKeys
        }
      },
      decisionAttestation: {
        disabled: client.decisionAttestation.disabled,
        signer: client.decisionAttestation.signer || null
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    for (const client of declarativeClients) {
      await this.clientService.save(client)
    }
  }

  private async syncClients(): Promise<void> {
    const clients = await this.clientService.findAll()

    this.logger.log('Start syncing clients data stores', {
      clientsCount: clients.length
    })

    // TODO: (@wcalderipe, 07/03/24) maybe change the execution to parallel?
    for (const client of clients) {
      await this.clientService.syncDataStore(client.clientId)
      this.logger.log(`Client public key`, {
        clientId: client.clientId,
        publicKey: client.decisionAttestation.signer?.publicKey
      })
    }
  }
}
