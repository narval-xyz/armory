import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client/vault'
import { SetRequired } from 'type-fest'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
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
        // TODO
        credentials: Prisma.JsonNull,
        integrity: connection.integrity,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
        revokedAt: connection.revokedAt
      }
    })

    return connection
  }
}
