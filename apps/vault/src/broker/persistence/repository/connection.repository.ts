import { PaginatedResult, PaginationOptions, getPaginatedResult, getPaginationQuery } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { Prisma, ProviderConnection } from '@prisma/client/vault'
import { omit } from 'lodash'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { BrokerException } from '../../core/exception/broker.exception'
import { ConnectionParseException } from '../../core/exception/connection-parse.exception'
import { NotFoundException } from '../../core/exception/not-found.exception'
import { Connection, ConnectionStatus } from '../../core/type/connection.type'

export type UpdateConnection = {
  clientId: string
  connectionId: string
  credentials?: unknown | null
  integrity?: string
  label?: string
  revokedAt?: Date
  status?: ConnectionStatus
  updatedAt?: Date
  url?: string
}

export type FilterOptions = {
  filters?: {
    status?: ConnectionStatus
  }
}

export type FindAllPaginatedOptions = PaginationOptions & FilterOptions

@Injectable()
export class ConnectionRepository {
  constructor(private prismaService: PrismaService) {}

  static getCursorOrderColumns(): Array<keyof ProviderConnection> {
    return ['createdAt']
  }

  static parseModel(model?: ProviderConnection | null): Connection {
    const parse = Connection.safeParse({
      ...model,
      connectionId: model?.id,
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

  static parseEntity(entity: Connection): ProviderConnection {
    return {
      clientId: entity.clientId,
      createdAt: entity.createdAt,
      credentials: entity.credentials ? entity.credentials : Prisma.JsonNull,
      id: entity.connectionId,
      integrity: entity.integrity,
      label: entity.label || null,
      provider: entity.provider,
      revokedAt: entity.revokedAt || null,
      status: entity.status,
      updatedAt: entity.updatedAt,
      url: entity.url || null
    }
  }

  async create(connection: Connection): Promise<Connection> {
    const data = {
      clientId: connection.clientId,
      createdAt: connection.createdAt,
      credentials: connection.credentials !== null ? connection.credentials : Prisma.JsonNull,
      id: connection.connectionId,
      integrity: connection.integrity,
      label: connection.label,
      provider: connection.provider,
      status: connection.status,
      updatedAt: connection.updatedAt,
      url: connection.url
    }

    await this.prismaService.providerConnection.upsert({
      where: { id: connection.connectionId },
      create: data,
      update: omit(data, 'id')
    })

    return connection
  }

  async update(updateConnection: UpdateConnection): Promise<boolean> {
    if (!updateConnection.connectionId) {
      throw new BrokerException({
        message: 'Missing connectionId',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      })
    }

    await this.prismaService.providerConnection.update({
      where: {
        id: updateConnection.connectionId,
        clientId: updateConnection.clientId
      },
      data: {
        credentials: updateConnection.credentials !== null ? updateConnection.credentials : Prisma.JsonNull,
        integrity: updateConnection.integrity,
        label: updateConnection.label,
        revokedAt: updateConnection.revokedAt,
        status: updateConnection.status,
        updatedAt: updateConnection.updatedAt,
        url: updateConnection.url
      }
    })

    return true
  }

  async findById(clientId: string, connectionId: string): Promise<Connection> {
    const model = await this.prismaService.providerConnection.findUnique({
      where: { clientId, id: connectionId }
    })

    if (model) {
      return ConnectionRepository.parseModel(model)
    }

    throw new NotFoundException({ context: { clientId, connectionId } })
  }

  async findAll(clientId: string, options?: FilterOptions): Promise<Connection[]> {
    const models = await this.prismaService.providerConnection.findMany({
      where: {
        clientId,
        status: options?.filters?.status
      }
    })

    return models.map(ConnectionRepository.parseModel)
  }

  async findAllPaginated(clientId: string, options?: FindAllPaginatedOptions): Promise<PaginatedResult<Connection>> {
    const pagination = getPaginationQuery({
      options: PaginationOptions.parse(options),
      cursorOrderColumns: ConnectionRepository.getCursorOrderColumns()
    })

    const models = await this.prismaService.providerConnection.findMany({
      where: {
        clientId,
        status: options?.filters?.status
      },
      ...pagination
    })

    const { data, page } = getPaginatedResult({ items: models, options: pagination })

    return {
      data: data.map(ConnectionRepository.parseModel),
      page
    }
  }

  async exists(clientId: string, id: string): Promise<boolean> {
    const count = await this.prismaService.providerConnection.count({
      where: { id, clientId }
    })

    return count > 0
  }
}
