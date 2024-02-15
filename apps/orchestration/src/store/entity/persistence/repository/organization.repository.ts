import { OrganizationEntity } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class OrganizationRepository {
  constructor(private prismaService: PrismaService) {}

  async create(uid: string): Promise<OrganizationEntity> {
    await this.prismaService.organizationEntity.create({
      data: { uid }
    })

    return { uid }
  }

  async findById(uid: string): Promise<OrganizationEntity | null> {
    return this.prismaService.organizationEntity.findUnique({ where: { uid } })
  }
}
