import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class KeyringRepository implements OnModuleInit {
  private logger = new Logger(KeyringRepository.name)

  constructor(private prismaService: PrismaService) {}

  async onModuleInit() {
    this.logger.log('KeyringRepository initialized')
  }

  async getEngine(engineUid: string) {
    return this.prismaService.engine.findUnique({
      where: {
        uid: engineUid
      }
    })
  }

  async createEngine(engineUid: string, masterKey: string, adminApiKey: string) {
    return this.prismaService.engine.create({
      data: {
        uid: engineUid,
        masterKey,
        adminApiKey
      }
    })
  }
}
