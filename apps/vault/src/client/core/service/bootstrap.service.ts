import { ConfigService } from '@narval/config-module'
import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { Config } from '../../../main.config'
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
    this.logger.log('Start client bootstrap')

    await this.persistDeclarativeClients()

    // TEMPORARY: Migrate the key-value format of the Client config into the table format.
    // Can be removed once this runs once.
    await this.clientService.migrateV1Data()

    await this.syncClients()
  }

  private async persistDeclarativeClients(): Promise<void> {
    const clients = this.configService.get('clients')
    if (!clients) return

    // Given ClientConfig type, build the Client type
    const declarativeClients: Client[] = clients.map((client) => ({
      clientId: client.clientId,
      name: client.name,
      configurationSource: 'declarative',
      backupPublicKey: client.backupPublicKey,
      baseUrl: client.baseUrl,
      auth: {
        disabled: client.auth.disabled,
        local: client.auth.local?.httpSigning?.methods?.jwsd
          ? {
              jwsd: client.auth.local?.httpSigning?.methods?.jwsd || null,
              allowedUsersJwksUrl: client.auth.local?.httpSigning?.allowedUsersJwksUrl || null,
              allowedUsers: client.auth.local?.httpSigning?.allowedUsers
            }
          : null,
        tokenValidation: {
          disabled: !!client.auth.tokenValidation?.disabled,
          url: client.auth.tokenValidation?.url || null,
          jwksUrl: client.auth.tokenValidation?.jwksUrl || null,
          pinnedPublicKey: client.auth.tokenValidation?.publicKey || null,
          verification: {
            audience: client.auth.tokenValidation?.verification?.audience || null,
            issuer: client.auth.tokenValidation?.verification?.issuer || null,
            maxTokenAge: client.auth.tokenValidation?.verification?.maxTokenAge || null,
            requireBoundTokens: !!client.auth.tokenValidation?.verification?.requireBoundTokens,
            allowBearerTokens: !!client.auth.tokenValidation?.verification?.allowBearerTokens,
            allowWildcard: client.auth.tokenValidation?.verification?.allowWildcard || null
          }
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    for (const client of declarativeClients) {
      await this.clientService.save(client, true)
    }
  }

  private async syncClients(): Promise<void> {
    const clients = await this.clientService.findAll()

    this.logger.log('Start syncing clients', {
      clientsCount: clients.length
    })
  }
}
