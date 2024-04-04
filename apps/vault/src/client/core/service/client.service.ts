import { HttpStatus, Injectable } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Client } from '../../../shared/type/domain.type'
import { ClientRepository } from '../../persistence/repository/client.repository'

@Injectable()
export class ClientService {
  constructor(private clientRepository: ClientRepository) {}

  async findByClientId(clientId: string): Promise<Client | null> {
    return this.clientRepository.findByClientId(clientId)
  }

  async onboard(client: Client): Promise<Client> {
    const exists = await this.clientRepository.findByClientId(client.clientId)

    if (exists) {
      throw new ApplicationException({
        message: 'client already exist',
        suggestedHttpStatusCode: HttpStatus.BAD_REQUEST,
        context: { clientId: client.clientId }
      })
    }

    try {
      await this.clientRepository.save(client)

      return client
    } catch (error) {
      throw new ApplicationException({
        message: 'Failed to onboard new client',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        origin: error,
        context: { client }
      })
    }
  }

  async findAll(): Promise<Client[]> {
    return this.clientRepository.findAll()
  }
}
