import { PolicyStore } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class PolicyDataStoreRepository {
  constructor(private prismaService: PrismaService) {}

  setDataStore(data: { orgId: string; version: number; data: PolicyStore }) {
    return this.prismaService.policyDataStore.create({ data })
  }

  async getLatestDataStore(orgId: string) {
    const version = await this.getLatestVersion(orgId)

    if (!version) return null

    const dataStore = await this.prismaService.policyDataStore.findFirst({ where: { orgId, version } })

    if (!dataStore) return null

    return dataStore
  }

 async getLatestVersion(orgId: string): Promise<number> {
    const data = await this.prismaService.policyDataStore.aggregate({
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
