import { Injectable } from '@nestjs/common'
import { SetRequired } from 'type-fest'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { ConnectionParseException } from '../../core/exception/connection-parse.exception'
import { Connection } from '../../core/type/connection.type'

@Injectable()
export class ConnectionRepository {
  constructor(private prismaService: PrismaService) {}

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

  async update(connection: SetRequired<Partial<Connection>, 'id'>): Promise<SetRequired<Partial<Connection>, 'id'>> {
    await this.prismaService.providerConnection.update({
      where: { id: connection.id },
      data: {
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

  async findById(clientId: string, id: string): Promise<Connection> {
    const result = await this.prismaService.providerConnection.findUnique({
      where: { clientId, id }
    })

    const parse = Connection.safeParse({
      ...result,
      // Prisma always returns null for optional fields that don't have a
      // value, rather than undefined. This is actually by design and aligns
      // with how NULL values work in databases.
      label: result?.label || undefined,
      revokedAt: result?.revokedAt || undefined,
      url: result?.url || undefined
    })

    if (parse.success) {
      return parse.data
    }

    throw new ConnectionParseException({
      context: { errors: parse.error.errors }
    })
  }

  async exists(clientId: string, id: string): Promise<boolean> {
    const count = await this.prismaService.providerConnection.count({
      where: { id, clientId }
    })

    return count > 0
  }
}
