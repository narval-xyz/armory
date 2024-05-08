import { PolicyStore } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { PolicyDataStore } from '@prisma/client/armory'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class PolicyDataStoreRepository {
  constructor(private prismaService: PrismaService) {}

  setDataStore(clientId: string, data: { version: number; data: PolicyStore }) {
    return this.prismaService.policyDataStore.create({ data: { clientId, ...data } })
  }

  async getLatestDataStore(clientId: string): Promise<PolicyDataStore | null> {
    const version = await this.getLatestVersion(clientId)

    if (!version) return null

    const dataStore = await this.prismaService.policyDataStore.findFirst({ where: { clientId, version } })

    if (!dataStore) return null

    return dataStore
  }

  async getLatestVersion(clientId: string): Promise<number> {
    const data = await this.prismaService.policyDataStore.aggregate({
      where: {
        clientId
      },
      _max: {
        version: true
      }
    })

    return data._max?.version || 0
  }
}
