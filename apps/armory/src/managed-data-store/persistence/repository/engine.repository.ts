import { Injectable } from '@nestjs/common'
import { Engine } from '@prisma/client/armory'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class EngineRepository {
  constructor(private prismaService: PrismaService) {}

  async getEngineData(orgId: string): Promise<Engine | null> {
    const engine = await this.prismaService.engine.findFirst({ where: { orgId } })

    if (!engine) return null

    return engine
  }
}
