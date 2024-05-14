import { Injectable } from '@nestjs/common'
import { ClientRepository } from '../../persistence/repository/client.repository'
import { Client } from '../type/client.type'

@Injectable()
export class ClientService {
  constructor(private clientRepository: ClientRepository) {}

  findById(id: string): Promise<Client | null> {
    return this.clientRepository.findById(id)
  }

  save(client: Client): Promise<Client> {
    return this.clientRepository.save(client)
  }
}
