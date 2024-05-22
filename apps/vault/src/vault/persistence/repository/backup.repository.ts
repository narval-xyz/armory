import { Injectable } from '@nestjs/common'
import { Backup } from '@prisma/client/vault'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class BackupRepository {
  constructor(private prismaService: PrismaService) {}

  async save(
    clientId: string,
    {
      backupPublicKeyHash,
      keyId,
      data
    }: {
      backupPublicKeyHash: string
      keyId: string
      data: string
    }
  ): Promise<void> {
    await this.prismaService.backup.create({
      data: {
        clientId,
        backupPublicKeyHash,
        keyId,
        data
      }
    })
  }

  async findByClientId(clientId: string): Promise<Backup[] | null> {
    return this.prismaService.backup.findMany({
      where: {
        clientId
      }
    })
  }
}
