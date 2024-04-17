import { EntityStore, PolicyStore } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'

type DataStore = { entity: EntityStore; policy: PolicyStore }

@Injectable()
export class DataStoreRepository {
  constructor(private prismaService: PrismaService) {}

  setDataStore(data: { orgId: string; version: number; data: DataStore }) {
    return this.prismaService.dataStore.create({ data })
  }

  async getLatestDataStore(orgId: string) {
    const version = await this.getLatestVersion(orgId)

    if (!version) return null

    const dataStore = await this.prismaService.dataStore.findFirst({ where: { orgId, version } })

    if (!dataStore) return null

    return { ...dataStore, data: dataStore.data as DataStore }
  }

  private async getLatestVersion(orgId: string): Promise<number> {
    const data = await this.prismaService.dataStore.aggregate({
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
