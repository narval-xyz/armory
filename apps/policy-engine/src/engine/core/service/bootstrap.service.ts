import { EncryptionService } from '@narval/encryption-module'
import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { BootstrapException } from '../exception/bootstrap.exception'
import { ClientService } from './client.service'

@Injectable()
export class BootstrapService {
  constructor(
    private clientService: ClientService,
    private encryptionService: EncryptionService,
    private logger: LoggerService
  ) {}

  async boot(): Promise<void> {
    this.logger.log('Start bootstrap')

    await this.checkEncryptionConfiguration()
    await this.syncClients()

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

  private async syncClients(): Promise<void> {
    const clients = await this.clientService.findAll()

    this.logger.log('Start syncing clients data stores', {
      clientsCount: clients.length
    })

    // TODO: (@wcalderipe, 07/03/24) maybe change the execution to parallel?
    for (const client of clients) {
      await this.clientService.syncDataStore(client.clientId)
      this.logger.log(`Client public key`, { clientId: client.clientId, publicKey: client.signer.publicKey })
    }
  }
}
