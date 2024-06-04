import { coerce } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { compact } from 'lodash/fp'
import { z } from 'zod'
import { KeyMetadata } from '../../../shared/module/key-value/core/repository/key-value.repository'
import { EncryptKeyValueService } from '../../../shared/module/key-value/core/service/encrypt-key-value.service'
import { Client, Collection } from '../../../shared/type/domain.type'

export const ClientIndex = z.array(z.string())

@Injectable()
export class ClientRepository {
  constructor(private encryptKeyValueService: EncryptKeyValueService) {}

  private KEY_PREFIX = Collection.CLIENT

  async findById(clientId: string): Promise<Client | null> {
    const value = await this.encryptKeyValueService.get(this.getKey(clientId))

    if (value) {
      return coerce.decode(Client, value)
    }

    return null
  }

  async save(client: Client): Promise<Client> {
    await this.encryptKeyValueService.set(
      this.getKey(client.clientId),
      coerce.encode(Client, client),
      this.getMetadata(client.clientId)
    )
    await this.index(client)

    return client
  }

  async getClientIndex(): Promise<string[]> {
    const index = await this.encryptKeyValueService.get(this.getIndexKey())

    if (index) {
      return coerce.decode(ClientIndex, index)
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
    const clients = await Promise.all(ids.map((id) => this.findById(id)))

    return compact(clients)
  }

  getMetadata(clientId: string): KeyMetadata {
    return { collection: Collection.CLIENT, clientId }
  }

  getKey(clientId: string): string {
    return `${this.KEY_PREFIX}:${clientId}`
  }

  getIndexKey(): string {
    return `${this.KEY_PREFIX}:index`
  }

  private async index(client: Client): Promise<boolean> {
    const currentIndex = await this.getClientIndex()

    await this.encryptKeyValueService.set(
      this.getIndexKey(),
      coerce.encode(ClientIndex, [...currentIndex, client.clientId]),
      this.getMetadata(client.clientId)
    )

    return true
  }
}
