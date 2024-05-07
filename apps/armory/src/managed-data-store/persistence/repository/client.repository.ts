import { Injectable } from '@nestjs/common'
import { Organization } from '@prisma/client/armory'
import { PrismaService } from '../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class ClientRepository {
  constructor(private prismaService: PrismaService) {}

  async getClient(id: string): Promise<Organization | null> {
    return this.prismaService.organization.findUnique({ where: { id } })
  }
}
