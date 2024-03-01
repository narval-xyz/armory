import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class EncryptionRepository {
  private logger = new Logger(EncryptionRepository.name)

  constructor(private prismaService: PrismaService) {}

  async getEngine(engineId: string) {
    return this.prismaService.engine.findUnique({
      where: {
        id: engineId
      }
    })
  }

  async createEngine(engineId: string, masterKey: string, adminApiKey?: string) {
    return this.prismaService.engine.create({
      data: {
        id: engineId,
        masterKey,
        adminApiKey
      }
    })
  }

  async saveMasterKey(engineId: string, masterKey: string) {
    return this.prismaService.engine.update({
      where: {
        id: engineId,
        masterKey: null // ONLY allow updating it if already null. We don't want to accidentally overwrite it!
      },
      data: {
        masterKey
      }
    })
  }
}
