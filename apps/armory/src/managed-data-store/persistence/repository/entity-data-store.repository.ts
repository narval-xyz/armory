import { EntityStore } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { EntityDataStore } from '@prisma/client/armory'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class EntityDataStoreRepository {
  constructor(private prismaService: PrismaService) {}

  setDataStore(orgId: string, data: { version: number; data: EntityStore }) {
    return this.prismaService.entityDataStore.create({ data: { orgId, ...data } })
  }

  async getLatestDataStore(orgId: string): Promise<EntityDataStore | null> {
    const version = await this.getLatestVersion(orgId)

    if (!version) return null

    const dataStore = await this.prismaService.entityDataStore.findFirst({ where: { orgId, version } })

    if (!dataStore) return null

    return dataStore
  }

  private async getLatestVersion(orgId: string): Promise<number> {
    const data = await this.prismaService.entityDataStore.aggregate({
      where: {
        orgId
      },
      _max: {
        version: true
      }
    })

    return data._max?.version || 0
  }
}
