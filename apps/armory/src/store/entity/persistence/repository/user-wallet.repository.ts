import { UserWalletEntity } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class UserWalletRepository {
  constructor(private prismaService: PrismaService) {}

  async create(orgId: string, userWallet: UserWalletEntity): Promise<UserWalletEntity> {
    await this.prismaService.userWalletEntity.create({
      data: {
        orgId,
        ...userWallet
      }
    })

    return userWallet
  }

  async findByOrgId(orgId: string): Promise<UserWalletEntity[]> {
    return this.prismaService.userWalletEntity.findMany({
      where: { orgId }
    })
  }
}
