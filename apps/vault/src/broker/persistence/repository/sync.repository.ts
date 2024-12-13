import { PaginatedResult, PaginationOptions, getPaginatedResult, getPaginationQuery } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common/decorators'
import { ProviderSync } from '@prisma/client/vault'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { NotFoundException } from '../../core/exception/not-found.exception'
import { Sync, SyncStatus } from '../../core/type/sync.type'

export type FindAllPaginatedOptions = PaginationOptions & {
  filters?: {
    connectionId?: string
    status?: SyncStatus
  }
}

@Injectable()
export class SyncRepository {
  constructor(private readonly prismaService: PrismaService) {}

  static parseModel(model?: ProviderSync | null): Sync {
    return Sync.parse({
      ...model,
      syncId: model?.id,
      // Prisma always returns null for optional fields that don't have a
      // value, rather than undefined. This is actually by design and aligns
      // with how NULL values work in databases.
      completedAt: model?.completedAt || undefined,
      error:
        model?.errorName || model?.errorMessage || model?.errorTraceId
          ? {
              name: model?.errorName || undefined,
              message: model?.errorMessage || undefined,
              traceId: model?.errorTraceId || undefined
            }
          : undefined
    })
  }

  static parseEntity(entity: Sync): ProviderSync {
    return {
      id: entity.syncId,
      clientId: entity.clientId,
      completedAt: entity.completedAt || null,
      connectionId: entity.connectionId,
      createdAt: entity.createdAt,
      errorName: entity.error?.name || null,
      errorMessage: entity.error?.message || null,
      errorTraceId: entity.error?.traceId || null,
      status: entity.status
    }
  }

  static getCursorOrderColumns(): Array<keyof ProviderSync> {
    return ['createdAt']
  }

  async create(sync: Sync): Promise<Sync> {
    await this.prismaService.providerSync.create({
      data: SyncRepository.parseEntity(sync)
    })

    return sync
  }

  async bulkCreate(syncs: Sync[]): Promise<Sync[]> {
    await this.prismaService.providerSync.createMany({
      data: syncs.map(SyncRepository.parseEntity)
    })

    return syncs
  }

  async findById(clientId: string, syncId: string): Promise<Sync> {
    const model = await this.prismaService.providerSync.findUnique({
      where: {
        clientId,
        id: syncId
      }
    })

    if (model) {
      return SyncRepository.parseModel(model)
    }

    throw new NotFoundException({ context: { clientId, syncId } })
  }

  async findAllPaginated(clientId: string, options?: FindAllPaginatedOptions): Promise<PaginatedResult<Sync>> {
    const pagination = getPaginationQuery({
      options,
      cursorOrderColumns: SyncRepository.getCursorOrderColumns()
    })

    const models = await this.prismaService.providerSync.findMany({
      where: {
        clientId,
        status: options?.filters?.status,
        connectionId: options?.filters?.connectionId
      },
      ...pagination
    })

    const { data, page } = getPaginatedResult({ items: models, options: pagination })

    return {
      data: data.map(SyncRepository.parseModel),
      page
    }
  }
}
