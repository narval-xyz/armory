import { PaginatedResult, PaginationOptions, getPaginatedResult, getPaginationQuery } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { ProviderConnection } from '@prisma/client/vault'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { BrokerException } from '../../core/exception/broker.exception'
import { ConnectionParseException } from '../../core/exception/connection-parse.exception'
import { NotFoundException } from '../../core/exception/not-found.exception'
import { Connection, ConnectionStatus, ConnectionWithCredentials } from '../../core/type/connection.type'

export type UpdateConnection = {
  clientId: string
  connectionId: string
  credentials?: unknown | null
  label?: string
  provider?: string
  revokedAt?: Date
  status?: ConnectionStatus
  updatedAt?: Date
  createdAt: Date
  url?: string
}

export type FilterOptions = {
  filters?: {
    status?: ConnectionStatus
  }
}

export type FindAllPaginatedOptions = PaginationOptions & FilterOptions

export const connectionSelectWithoutCredentials = {
  id: true,
  clientId: true,
  provider: true,
  url: true,
  label: true,
  credentials: false, // DO NOT INCLUDE CREDENTIALS
  status: true,
  integrity: true,
  createdAt: true,
  updatedAt: true,
  revokedAt: true
}

@Injectable()
export class ConnectionRepository {
  constructor(private prismaService: PrismaService) {}

  static getCursorOrderColumns(): Array<keyof ProviderConnection> {
    return ['createdAt']
  }
  static parseModel<T extends boolean = false>(
    model?: Partial<ProviderConnection> | null,
    includeCredentials?: T
  ): T extends true ? ConnectionWithCredentials : Connection {
    const connectionData = {
      ...model,
      credentials: model?.credentials ? JSON.parse(model.credentials) : null,
      connectionId: model?.id,
      // Prisma always returns null for optional fields that don't have a
      // value, rather than undefined. This is actually by design and aligns
      // with how NULL values work in databases.
      label: model?.label || undefined,
      revokedAt: model?.revokedAt || undefined,
      url: model?.url || undefined
    }

    const schema = includeCredentials ? ConnectionWithCredentials : Connection
    const parse = schema.safeParse(connectionData)

    if (parse.success) {
      return parse.data as T extends true ? ConnectionWithCredentials : Connection
    }

    throw new ConnectionParseException({
      context: { errors: parse.error.errors }
    })
  }

  async create(connection: ConnectionWithCredentials): Promise<Connection> {
    const data = {
      id: connection.connectionId,
      clientId: connection.clientId,
      credentials: connection.credentials !== null ? JSON.stringify(connection.credentials) : null,
      label: connection.label || null,
      provider: connection.provider,
      status: connection.status,
      url: connection.url || null,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt
    }

    await this.prismaService.providerConnection.upsert({
      where: { id: data.id },
      create: data,
      update: data
    })

    return Connection.parse(connection)
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
        id: updateConnection.connectionId,
        clientId: updateConnection.clientId,
        provider: updateConnection.provider,
        url: updateConnection.url,
        label: updateConnection.label,
        credentials: updateConnection.credentials !== null ? JSON.stringify(updateConnection.credentials) : null,
        status: updateConnection.status,
        createdAt: updateConnection.createdAt,
        revokedAt: updateConnection.revokedAt,
        updatedAt: updateConnection.updatedAt
      }
    })

    return true
  }

  async findById<T extends boolean = false>(
    clientId: string,
    connectionId: string,
    includeCredentials?: T
  ): Promise<T extends true ? ConnectionWithCredentials : Connection> {
    const model = await this.prismaService.providerConnection.findUnique({
      where: { clientId, id: connectionId }
    })

    if (model) {
      return ConnectionRepository.parseModel<T>(model, includeCredentials)
    }

    throw new NotFoundException({ context: { clientId, connectionId } })
  }

  async findAll<T extends boolean = false>(
    clientId: string,
    options?: FilterOptions,
    includeCredentials?: T
  ): Promise<T extends true ? ConnectionWithCredentials[] : Connection[]> {
    const models = await this.prismaService.providerConnection.findMany({
      where: {
        clientId,
        status: options?.filters?.status
      },
      ...(includeCredentials
        ? {}
        : {
            select: connectionSelectWithoutCredentials
          })
    })

    return models.map((model) => ConnectionRepository.parseModel(model, includeCredentials)) as T extends true
      ? ConnectionWithCredentials[]
      : Connection[]
  }

  async findAllPaginated(clientId: string, options?: FindAllPaginatedOptions): Promise<PaginatedResult<Connection>> {
    const pagination = getPaginationQuery({
      options: PaginationOptions.parse(options),
      cursorOrderColumns: ConnectionRepository.getCursorOrderColumns()
    })

    const models = await this.prismaService.providerConnection.findMany({
      select: connectionSelectWithoutCredentials,
      where: {
        clientId,
        status: options?.filters?.status
      },
      ...pagination
    })

    const { data, page } = getPaginatedResult({ items: models, options: pagination })

    return {
      data: data.map((model) => ConnectionRepository.parseModel(model, false)),
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
