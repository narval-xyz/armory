import { UserWallet } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class UserWalletRepository {
  constructor(private prismaService: PrismaService) {}

  async assign(assignment: UserWallet): Promise<UserWallet> {
    await this.prismaService.userWalletAssignment.create({
      data: assignment
    })

    return assignment
  }
}
