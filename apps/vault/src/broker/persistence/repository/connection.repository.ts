import { PaginatedResult, PaginationOptions, applyPagination, getPaginatedResult } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { ProviderConnection } from '@prisma/client/vault'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { BrokerException } from '../../core/exception/broker.exception'
import { ConnectionInvalidCredentialsException } from '../../core/exception/connection-invalid-credentials.exception'
import { ConnectionParseException } from '../../core/exception/connection-parse.exception'
import { NotFoundException } from '../../core/exception/not-found.exception'
import { Connection, ConnectionStatus, ConnectionWithCredentials } from '../../core/type/connection.type'
import { Provider } from '../../core/type/provider.type'

export type UpdateConnection = {
  clientId: string
  connectionId: string
  credentials?: unknown | null
  label?: string
  provider: Provider
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

export type FindAllOptions = FilterOptions & { pagination?: PaginationOptions }

export const SELECT_WITHOUT_CREDENTIALS = {
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
  constructor(private readonly prismaService: PrismaService) {}

  static parseModel(model?: Partial<ProviderConnection> | null): Connection {
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

  async create(connection: ConnectionWithCredentials): Promise<Connection> {
    const data = {
      clientId: connection.clientId,
      createdAt: connection.createdAt,
      credentials: PrismaService.toStringJson(connection.credentials),
      id: connection.connectionId,
      label: connection.label || null,
      provider: connection.provider,
      status: connection.status,
      updatedAt: connection.updatedAt,
      url: connection.url || null
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
        clientId: updateConnection.clientId,
        createdAt: updateConnection.createdAt,
        credentials: PrismaService.toStringJson(updateConnection.credentials),
        id: updateConnection.connectionId,
        label: updateConnection.label,
        provider: updateConnection.provider,
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
      where: { clientId, id: connectionId },
      select: SELECT_WITHOUT_CREDENTIALS
    })

    if (model) {
      return ConnectionRepository.parseModel(model)
    }

    throw new NotFoundException({ context: { clientId, connectionId } })
  }

  async findAll(clientId: string, options?: FindAllOptions): Promise<PaginatedResult<Connection>> {
    const pagination = applyPagination(options?.pagination)
    const models = await this.prismaService.providerConnection.findMany({
      where: {
        clientId,
        status: options?.filters?.status
      },
      select: SELECT_WITHOUT_CREDENTIALS,
      ...pagination
    })
    const { data, page } = getPaginatedResult({ items: models, pagination })

    return {
      data: data.map((model) => ConnectionRepository.parseModel(model)),
      page
    }
  }

  async exists(clientId: string, id: string): Promise<boolean> {
    const count = await this.prismaService.providerConnection.count({
      where: { id, clientId }
    })

    return count > 0
  }

  async findCredentialsJson({ connectionId }: { connectionId: string }): Promise<unknown> {
    const model = await this.prismaService.providerConnection.findUnique({
      where: { id: connectionId }
    })

    if (model && model.credentials) {
      return this.toCredentialsJson(model.credentials)
    }

    return null
  }

  async findAllWithCredentials(
    clientId: string,
    options?: FindAllOptions
  ): Promise<PaginatedResult<ConnectionWithCredentials>> {
    const pagination = applyPagination(options?.pagination)
    const models = await this.prismaService.providerConnection.findMany({
      where: {
        clientId,
        status: options?.filters?.status
      },
      ...pagination
    })
    const { data, page } = getPaginatedResult({ items: models, pagination })

    return {
      data: data.map((model) => ({
        ...ConnectionRepository.parseModel(model),
        credentials: model.credentials ? this.toCredentialsJson(model.credentials) : null
      })),
      page
    }
  }

  async findWithCredentialsById(clientId: string, connectionId: string): Promise<ConnectionWithCredentials> {
    const model = await this.prismaService.providerConnection.findUnique({
      where: { clientId, id: connectionId }
    })

    if (model) {
      return {
        ...ConnectionRepository.parseModel(model),
        credentials: model.credentials ? this.toCredentialsJson(model.credentials) : null
      }
    }

    throw new NotFoundException({ context: { clientId, connectionId } })
  }

  private toCredentialsJson(value: string) {
    try {
      return JSON.parse(value)
    } catch (error) {
      throw new ConnectionInvalidCredentialsException({
        message: `Invalid stored connection credential JSON`,
        suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        origin: error
      })
    }
  }
}
