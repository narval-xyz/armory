import { Injectable } from '@nestjs/common'
import { compact } from 'lodash/fp'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { clientIndexSchema, clientSchema } from '../../../shared/schema/client.schema'
import { Client } from '../../../shared/type/domain.type'

@Injectable()
export class ClientRepository {
  constructor(private encryptKeyValueService: EncryptKeyValueService) {}

  async findByClientId(clientId: string): Promise<Client | null> {
    const value = await this.encryptKeyValueService.get(this.getKey(clientId))

    if (value) {
      return this.decode(value)
    }

    return null
  }

  async save(client: Client): Promise<Client> {
    await this.encryptKeyValueService.set(this.getKey(client.clientId), this.encode(client))
    await this.index(client)

    return client
  }

  async getClientIndex(): Promise<string[]> {
    const index = await this.encryptKeyValueService.get(this.getIndexKey())

    if (index) {
      return this.decodeIndex(index)
    }

    return []
  }

  // TODO: (@wcalderipe, 07/03/24) we need to rethink this strategy. If we use a
  // SQL database, this could generate a massive amount of queries; thus,
  // degrading the performance.
  //
  // An option is to move these general queries `findBy`, findAll`, etc to the
  // KeyValeuRepository implementation letting each implementation pick the best
  // strategy to solve the problem (e.g. where query in SQL)
  async findAll(): Promise<Client[]> {
    const ids = await this.getClientIndex()
    const clients = await Promise.all(ids.map((id) => this.findByClientId(id)))

    return compact(clients)
  }

  getKey(clientId: string): string {
    return `client:${clientId}`
  }

  getIndexKey(): string {
    return 'client:index'
  }

  private async index(client: Client): Promise<boolean> {
    const currentIndex = await this.getClientIndex()

    await this.encryptKeyValueService.set(this.getIndexKey(), this.encodeIndex([...currentIndex, client.clientId]))

    return true
  }

  private encode(client: Client): string {
    return EncryptKeyValueService.encode(clientSchema.parse(client))
  }

  private decode(value: string): Client {
    return clientSchema.parse(JSON.parse(value))
  }

  private encodeIndex(value: string[]): string {
    return EncryptKeyValueService.encode(clientIndexSchema.parse(value))
  }

  private decodeIndex(value: string): string[] {
    return clientIndexSchema.parse(JSON.parse(value))
  }
}
