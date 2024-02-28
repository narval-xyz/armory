import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class KeyringRepository {
  private logger = new Logger(KeyringRepository.name)

  constructor(private prismaService: PrismaService) {}

  async getEngine(engineId: string) {
    return this.prismaService.engine.findUnique({
      where: {
        id: engineId
      }
    })
  }

  async createEngine(engineId: string, masterKey: string, adminApiKey: string) {
    return this.prismaService.engine.create({
      data: {
        id: engineId,
        masterKey,
        adminApiKey
      }
    })
  }
}
