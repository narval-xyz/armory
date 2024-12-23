import { PaginatedResult, PaginationOptions, applyPagination, getPaginatedResult } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { ProviderConnection, ProviderKnownDestination, ProviderKnownDestinationConnection } from '@prisma/client/vault'
import { z } from 'zod'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { NotFoundException } from '../../core/exception/not-found.exception'
import { Provider } from '../../core/type/connection.type'
import { KnownDestination } from '../../core/type/indexed-resources.type'
import { ConnectionRepository, connectionSelectWithoutCredentials } from './connection.repository'

type FindAllFilters = {
  filters?: {
    externalIds?: string[]
    addresses?: string[]
  }
}

type ProviderKnownDestinationAndRelations = ProviderKnownDestination & {
  connections: { connection: Partial<ProviderConnection> }[]
}

export type FindAllOptions = FindAllFilters & { pagination?: PaginationOptions }

const UpdateKnownDestination = KnownDestination.pick({
  label: true,
  connections: true,
  externalClassification: true,
  assetId: true
})
export type UpdateKnownDestination = z.infer<typeof UpdateKnownDestination>

@Injectable()
export class KnownDestinationRepository {
  constructor(private prismaService: PrismaService) {}

  static parseModel(model: ProviderKnownDestinationAndRelations): KnownDestination {
    const { connections, id, ...rest } = model

    const validConnections = connections.map((join) => {
      return ConnectionRepository.parseModel(join.connection)
    })

    return {
      ...rest,
      connections: validConnections,
      knownDestinationId: id,
      provider: z.nativeEnum(Provider).parse(model.provider)
    }
  }

  static parseEntity(entity: KnownDestination): ProviderKnownDestination {
    return {
      id: entity.knownDestinationId,
      clientId: entity.clientId,
      label: entity.label || null,
      provider: entity.provider,
      externalId: entity.externalId,
      externalClassification: entity.externalClassification || null,
      address: entity.address,
      assetId: entity.assetId || null,
      networkId: entity.networkId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    }
  }

  async findByClientId(clientId: string, opts?: PaginationOptions): Promise<PaginatedResult<KnownDestination>> {
    const pagination = applyPagination(opts)

    const result = await this.prismaService.providerKnownDestination.findMany({
      where: { clientId },
      include: {
        connections: {
          include: {
            connection: {
              select: connectionSelectWithoutCredentials
            }
          }
        }
      },
      ...pagination
    })

    const { data, page } = getPaginatedResult({ items: result, pagination })
    return {
      data: data.map(KnownDestinationRepository.parseModel),
      page
    }
  }

  async findById(clientId: string, knownDestinationId: string): Promise<KnownDestination> {
    const knownDestination = await this.prismaService.providerKnownDestination.findUnique({
      where: { clientId, id: knownDestinationId },
      include: {
        connections: {
          include: {
            connection: {
              select: connectionSelectWithoutCredentials
            }
          }
        }
      }
    })
    if (!knownDestination) {
      throw new NotFoundException({
        message: 'Address not found',
        context: { knownDestinationId }
      })
    }

    return KnownDestinationRepository.parseModel(knownDestination)
  }

  async findAll(clientId: string, opts?: FindAllOptions): Promise<PaginatedResult<KnownDestination>> {
    const pagination = applyPagination(opts?.pagination)

    const models = await this.prismaService.providerKnownDestination.findMany({
      where: {
        clientId,
        ...(opts?.filters?.addresses
          ? {
              address: {
                in: opts.filters.addresses
              }
            }
          : {}),
        ...(opts?.filters?.externalIds
          ? {
              externalId: {
                in: opts.filters.externalIds
              }
            }
          : {})
      },
      include: {
        connections: {
          include: {
            connection: {
              select: connectionSelectWithoutCredentials
            }
          }
        }
      },
      ...pagination
    })

    const { data, page } = getPaginatedResult({ items: models, pagination })

    return {
      data: data.map(KnownDestinationRepository.parseModel),
      page
    }
  }

  async bulkCreate(knownDestinations: KnownDestination[]): Promise<KnownDestination[]> {
    const providerKnownDestinations: ProviderKnownDestination[] = knownDestinations.map(
      KnownDestinationRepository.parseEntity
    )
    const providerKnownDestinationConnections: ProviderKnownDestinationConnection[] = knownDestinations.flatMap(
      this.getKnownDestinationConnectionModel
    )

    await this.prismaService.$transaction(async (tx) => {
      await tx.providerKnownDestination.createMany({
        data: providerKnownDestinations,
        skipDuplicates: true
      })

      await tx.providerKnownDestinationConnection.createMany({
        data: providerKnownDestinationConnections,
        skipDuplicates: true
      })
    })

    const created = await this.prismaService.providerKnownDestination.findMany({
      where: {
        id: {
          in: knownDestinations.map((kd) => kd.knownDestinationId)
        }
      },
      include: {
        connections: {
          include: {
            connection: {
              select: connectionSelectWithoutCredentials
            }
          }
        }
      }
    })

    // Use the same parsing logic as findAll
    return created.map(KnownDestinationRepository.parseModel)
  }

  async bulkDelete(knownDestinations: KnownDestination[]): Promise<number> {
    await this.prismaService.providerKnownDestinationConnection.deleteMany({
      where: {
        knownDestinationId: {
          in: knownDestinations.map((d) => d.knownDestinationId)
        }
      }
    })

    const { count } = await this.prismaService.providerKnownDestination.deleteMany({
      where: {
        id: {
          in: knownDestinations.map((d) => d.knownDestinationId)
        }
      }
    })
    return count
  }

  async connect(clientId: string, knownDestinationId: string, connectionId: string) {
    const alreadyConnected = await this.prismaService.providerKnownDestinationConnection.findFirst({
      where: {
        clientId,
        knownDestinationId,
        connectionId
      }
    })

    if (alreadyConnected) {
      return
    }

    const connectionExists = await this.prismaService.providerConnection.findUnique({
      where: { clientId, id: connectionId }
    })

    if (!connectionExists) {
      throw new NotFoundException({
        message: 'Connection not found',
        context: { clientId, connectionId }
      })
    }

    const knownDestinationExists = await this.prismaService.providerKnownDestination.findUnique({
      where: { clientId, id: knownDestinationId }
    })

    if (!knownDestinationExists) {
      throw new NotFoundException({
        message: 'Known destination not found',
        context: { clientId, knownDestinationId }
      })
    }

    await this.prismaService.providerKnownDestinationConnection.create({
      data: {
        clientId,
        knownDestinationId,
        connectionId
      }
    })
  }

  async update(knownDestinationId: string, data: UpdateKnownDestination) {
    const existingDest = await this.prismaService.providerKnownDestination.findUnique({
      where: { id: knownDestinationId },
      include: {
        connections: {
          include: {
            connection: {
              select: connectionSelectWithoutCredentials
            }
          }
        }
      }
    })

    if (!existingDest) {
      throw new NotFoundException({
        message: 'Destination not found',
        context: { id: knownDestinationId }
      })
    }

    const existingEntity = KnownDestinationRepository.parseModel(existingDest)

    await Promise.all(
      data.connections
        .filter((connection) => !existingEntity.connections.find((c) => c.connectionId === connection.connectionId))
        .map(async (connection) => {
          await this.connect(existingEntity.clientId, knownDestinationId, connection.connectionId)
        })
    )

    const updatedKnownDest = await this.prismaService.providerKnownDestination.update({
      where: { id: knownDestinationId },
      data: KnownDestinationRepository.parseEntity({
        ...existingEntity,
        ...data
      }),
      include: {
        connections: {
          include: {
            connection: {
              select: connectionSelectWithoutCredentials
            }
          }
        }
      }
    })

    return KnownDestinationRepository.parseModel(updatedKnownDest)
  }

  private getKnownDestinationConnectionModel(knownDestination: KnownDestination): ProviderKnownDestinationConnection[] {
    return knownDestination.connections.map((connection) => {
      return {
        clientId: knownDestination.clientId,
        knownDestinationId: knownDestination.knownDestinationId,
        connectionId: connection.connectionId,
        createdAt: knownDestination.createdAt
      }
    })
  }
}
