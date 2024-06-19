import { EncryptionService } from '@narval/encryption-module'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { BootstrapException } from '../exception/bootstrap.exception'
import { ClientService } from './client.service'

@Injectable()
export class BootstrapService {
  private logger = new Logger(BootstrapService.name)

  constructor(
    private clientService: ClientService,
    private encryptionService: EncryptionService
  ) {}

  async boot(): Promise<void> {
    this.logger.log('Start bootstrap')

    await this.checkEncryptionConfiguration()
    const success = await this.syncClients()

    this.logger.log('Boostrap sync status', { success })
    this.logger.log('Bootstrap end')
  }

  private async checkEncryptionConfiguration(): Promise<void> {
    this.logger.log('Check encryption configuration')

    try {
      this.encryptionService.getKeyring()
      this.logger.log('Encryption keyring configured')
    } catch (error) {
      throw new BootstrapException('Encryption keyring not found', { origin: error })
    }
  }

  private async syncClients(): Promise<boolean> {
    const SYNC_ATTEMPTS = 3

    const clients = await this.clientService.findAll()

    this.logger.log('Start syncing clients data stores', {
      clientsCount: clients.length
    })

    const clientsSyncStatus = await Promise.all(
      clients.map(async (client) => {
        let isSynced = false

        for (let i = 0; i <= SYNC_ATTEMPTS; i++) {
          try {
            isSynced = await this.clientService.syncDataStore(client.clientId)
            if (!isSynced) {
              throw new ApplicationException({
                message: 'Failed to sync client data store',
                suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                context: { clientId: client.clientId }
              })
            }
            break
          } catch (error) {
            if (i < SYNC_ATTEMPTS) {
              this.logger.warn('Failed to sync client data store, retrying', {
                clientId: client.clientId,
                attempt: i + 1
              })
              await new Promise((resolve) => setTimeout(resolve, 5000))
              continue
            }
          }
        }

        return isSynced
      })
    )

    return clientsSyncStatus.every((isSynced) => isSynced)
  }
}
