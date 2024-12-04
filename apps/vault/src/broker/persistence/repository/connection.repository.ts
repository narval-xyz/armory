import { HttpStatus, Injectable } from '@nestjs/common'
import { SetRequired } from 'type-fest'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { ConnectionParseException } from '../../core/exception/connection-parse.exception'
import { Connection } from '../../core/type/connection.type'

@Injectable()
export class ConnectionRepository {
  constructor(private prismaService: PrismaService) {}

  async save(connection: SetRequired<Connection, 'updatedAt'>): Promise<Connection> {
    await this.prismaService.providerConnection.create({
      data: {
        id: connection.id,
        clientId: connection.clientId,
        provider: connection.provider,
        url: connection.url,
        label: connection.label,
        status: connection.status,
        // TODO: ENCRYPTION
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
      revokedAt: result?.revokedAt || undefined
    })

    if (parse.success) {
      return parse.data
    }

    throw new ConnectionParseException({
      message: 'Fail to parse connection after read',
      suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      context: {
        errors: parse.error.errors
      }
    })
  }
}
