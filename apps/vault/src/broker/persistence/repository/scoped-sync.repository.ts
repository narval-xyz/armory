import { PaginatedResult, PaginationOptions, applyPagination, getPaginatedResult } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common/decorators'
import { ProviderScopedSync } from '@prisma/client/vault'
import { z } from 'zod'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'
import { ModelInvalidException } from '../../core/exception/model-invalid.exception'
import { NotFoundException } from '../../core/exception/not-found.exception'
import { ConnectionScope } from '../../core/type/scope.type'
import { RawAccount, RawAccountSyncFailure, ScopedSync, ScopedSyncStatus } from '../../core/type/scoped-sync.type'

export type FindAllOptions = PaginationOptions & {
  filters?: {
    status?: ScopedSyncStatus
  }
  pagination?: PaginationOptions
}

export type UpdateScopedSync = {
  clientId: string
  scopedSyncId: string
  completedAt?: Date
  status?: ScopedSyncStatus
  error?: ScopedSync['error']
  failures?: RawAccountSyncFailure[]
}

const parseErrorEntity = (
  error: ScopedSync['error']
): Pick<ProviderScopedSync, 'errorName' | 'errorMessage' | 'errorTraceId'> => ({
  errorName: error?.name || null,
  errorMessage: error?.message || null,
  errorTraceId: error?.traceId || null
})

@Injectable()
export class ScopedSyncRepository {
  constructor(private readonly prismaService: PrismaService) {}

  static parseModel(model?: ProviderScopedSync | null): ScopedSync {
    if (model) {
      const { id, ...rest } = model

      return ScopedSync.parse({
        ...rest,
        scopedSyncId: id,
        // Prisma always returns null for optional fields that don't have a
        // value, rather than undefined. This is actually by design and aligns
        // with how NULL values work in databases.
        rawAccounts: model.rawAccounts ? z.array(RawAccount).parse(PrismaService.toJson(model.rawAccounts)) : [],
        completedAt: model.completedAt || undefined,
        failures: z.array(RawAccountSyncFailure).parse(PrismaService.toJson(model.failedRawAccounts) || []),
        error:
          model.errorName || model.errorMessage || model.errorTraceId
            ? {
                name: model.errorName || undefined,
                message: model.errorMessage || undefined,
                traceId: model.errorTraceId || undefined
              }
            : undefined
      })
    }

    throw new ModelInvalidException()
  }

  static parseEntity(entity: ScopedSync): ProviderScopedSync {
    return {
      id: entity.scopedSyncId,
      clientId: entity.clientId,
      completedAt: entity.completedAt || null,
      connectionId: entity.connectionId,
      rawAccounts: z.string().parse(PrismaService.toStringJson(entity.rawAccounts)),
      createdAt: entity.createdAt,
      status: entity.status,
      failedRawAccounts: PrismaService.toStringJson(entity.failures),
      ...parseErrorEntity(entity.error)
    }
  }

  async create(scopedSync: ScopedSync): Promise<ScopedSync> {
    await this.prismaService.providerScopedSync.create({
      data: ScopedSyncRepository.parseEntity(scopedSync)
    })

    return scopedSync
  }

  async bulkCreate(scopedSyncs: ScopedSync[]): Promise<ScopedSync[]> {
    await this.prismaService.providerScopedSync.createMany({
      data: scopedSyncs.map(ScopedSyncRepository.parseEntity)
    })

    return scopedSyncs
  }

  async update(updateScopedSync: UpdateScopedSync): Promise<boolean> {
    const failures = updateScopedSync.failures ? PrismaService.toStringJson(updateScopedSync.failures) : null
    await this.prismaService.providerScopedSync.update({
      where: {
        id: updateScopedSync.scopedSyncId,
        clientId: updateScopedSync.clientId
      },
      data: {
        completedAt: updateScopedSync.completedAt,
        status: updateScopedSync.status,
        ...(updateScopedSync.error ? parseErrorEntity(updateScopedSync.error) : {}),
        failedRawAccounts: failures
      }
    })

    return true
  }

  async findById({ clientId, connectionId }: ConnectionScope, scopedSyncId: string): Promise<ScopedSync> {
    const model = await this.prismaService.providerScopedSync.findUnique({
      where: {
        clientId,
        id: scopedSyncId,
        connectionId
      }
    })

    if (model) {
      return ScopedSyncRepository.parseModel(model)
    }

    throw new NotFoundException({ context: { clientId, scopedSyncId } })
  }

  async findAll(
    { clientId, connectionId }: ConnectionScope,
    options?: FindAllOptions
  ): Promise<PaginatedResult<ScopedSync>> {
    const pagination = applyPagination(options?.pagination)

    const models = await this.prismaService.providerScopedSync.findMany({
      where: {
        clientId,
        status: options?.filters?.status,
        connectionId
      },
      ...pagination
    })

    const { data, page } = getPaginatedResult({ items: models, pagination })

    return {
      data: data.map(ScopedSyncRepository.parseModel),
      page
    }
  }

  async exists({ clientId, connectionId, status }: ConnectionScope & { status?: ScopedSyncStatus }): Promise<boolean> {
    const count = await this.prismaService.providerScopedSync.count({
      where: {
        clientId,
        connectionId,
        ...(status ? { status } : {})
      }
    })
    return count > 0
  }
}
