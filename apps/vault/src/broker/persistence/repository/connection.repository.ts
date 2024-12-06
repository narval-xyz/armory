import { Injectable } from '@nestjs/common'
import { Prisma, ProviderConnection } from '@prisma/client/vault'
import { SetRequired } from 'type-fest'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { ConnectionParseException } from '../../core/exception/connection-parse.exception'
import { Connection, Credentials } from '../../core/type/connection.type'

type Update = SetRequired<
  Partial<
    Omit<Connection, 'credentials'> & {
      credentials: Credentials | null
    }
  >,
  'id'
>

@Injectable()
export class ConnectionRepository {
  constructor(private prismaService: PrismaService) {}

  static map(model?: ProviderConnection | null): Connection {
    const parse = Connection.safeParse({
      ...model,
      // Prisma always returns null for optional fields that don't have a
      // value, rather than undefined. This is actually by design and aligns
      // with how NULL values work in databases.
      label: model?.label || undefined,
      revokedAt: model?.revokedAt || undefined,
      url: model?.url || undefined
    })

    if (parse.success) {
      return parse.data
    }

    throw new ConnectionParseException({
      context: { errors: parse.error.errors }
    })
  }

  async create(connection: SetRequired<Connection, 'updatedAt'>): Promise<Connection> {
    await this.prismaService.providerConnection.upsert({
      where: { id: connection.id },
      update: {
        url: connection.url,
        label: connection.label,
        status: connection.status,
        credentials: connection.credentials,
        integrity: connection.integrity,
        updatedAt: connection.updatedAt
      },
      create: {
        id: connection.id,
        clientId: connection.clientId,
        provider: connection.provider,
        url: connection.url,
        label: connection.label,
        status: connection.status,
        credentials: connection.credentials,
        integrity: connection.integrity,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
        revokedAt: connection.revokedAt
      }
    })

    return connection
  }

  async update(connection: Update): Promise<Update> {
    await this.prismaService.providerConnection.update({
      where: { id: connection.id },
      data: {
        id: connection.id,
        clientId: connection.clientId,
        provider: connection.provider,
        url: connection.url,
        label: connection.label,
        status: connection.status,
        credentials: connection.credentials === null ? Prisma.JsonNull : connection.credentials,
        integrity: connection.integrity,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
        revokedAt: connection.revokedAt
      }
    })

    return connection
  }

  async findById(clientId: string, id: string): Promise<Connection> {
    const model = await this.prismaService.providerConnection.findUnique({
      where: { clientId, id }
    })

    return ConnectionRepository.map(model)
  }

  async findAll(clientId: string): Promise<Connection[]> {
    const models = await this.prismaService.providerConnection.findMany({
      where: { clientId }
    })

    return models.map(ConnectionRepository.map)
  }

  async exists(clientId: string, id: string): Promise<boolean> {
    const count = await this.prismaService.providerConnection.count({
      where: { id, clientId }
    })

    return count > 0
  }
}
