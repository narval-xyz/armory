import { Injectable } from '@nestjs/common'
import { Client } from '@prisma/client/armory'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'

// TODO: Review
@Injectable()
export class ClientRepository {
  constructor(private prismaService: PrismaService) {}

  async getClient(id: string): Promise<Client | null> {
    return this.prismaService.client.findUnique({ where: { id } })
  }
}
