import { LoggerService } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { ClientService } from './client.service'

@Injectable()
export class BootstrapService {
  constructor(
    private clientService: ClientService,
    private logger: LoggerService
  ) {}

  async boot(): Promise<void> {
    this.logger.log('Start app bootstrap')

    await this.syncClients()
  }

  private async syncClients(): Promise<void> {
    const clients = await this.clientService.findAll()

    this.logger.log('Start syncing clients', {
      clientsCount: clients.length
    })
  }
}
