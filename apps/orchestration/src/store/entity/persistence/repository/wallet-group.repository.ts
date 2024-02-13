import { WalletGroupEntity } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class WalletGroupRepository {
  constructor(private prismaService: PrismaService) {}

  async maybeCreate(orgId: string, walletGroup: WalletGroupEntity): Promise<WalletGroupEntity> {
    await this.prismaService.$transaction(async (tx) => {
      const group = await tx.walletGroupEntity.findUnique({
        where: { uid: walletGroup.uid }
      })

      if (!group) {
        await tx.walletGroupEntity.create({
          data: {
            orgId,
            uid: walletGroup.uid
          }
        })
      }

      if (walletGroup.wallets.length) {
        await this.enroll(walletGroup.uid, walletGroup.wallets)
      }
    })

    return walletGroup
  }

  async update(walletGroup: WalletGroupEntity): Promise<WalletGroupEntity> {
    if (walletGroup.wallets.length) {
      await this.enroll(walletGroup.uid, walletGroup.wallets)
    }

    return walletGroup
  }

  private async enroll(groupId: string, walletIds: string[]): Promise<boolean> {
    try {
      const memberships = walletIds.map((walletId) => ({
        wallet: walletId,
        group: groupId
      }))

      await this.prismaService.walletGroupMembership.createMany({
        data: memberships,
        skipDuplicates: true
      })

      return true
    } catch (error) {
      return false
    }
  }

  async findById(uid: string): Promise<WalletGroupEntity | null> {
    const group = await this.prismaService.walletGroupEntity.findUnique({
      where: { uid }
    })

    if (group) {
      const wallets = await this.prismaService.walletGroupMembership.findMany({
        where: { group: uid }
      })

      return {
        uid: group.uid,
        wallets: wallets.map(({ wallet }) => wallet)
      }
    }

    return null
  }
}
