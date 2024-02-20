import { WalletGroupEntity } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { WalletGroupEntity as GroupModel, WalletGroupMemberEntity as MemberModel } from '@prisma/client/armory'
import { map } from 'lodash/fp'
import { PrismaService } from '../../../../shared/module/persistence/service/prisma.service'

type Model = GroupModel & {
  members: MemberModel[]
}

@Injectable()
export class WalletGroupRepository {
  constructor(private prismaService: PrismaService) {}

  async create(orgId: string, walletGroup: WalletGroupEntity): Promise<WalletGroupEntity> {
    const group = await this.prismaService.walletGroupEntity.findUnique({
      where: { uid: walletGroup.uid }
    })

    if (!group) {
      await this.prismaService.walletGroupEntity.create({
        data: {
          orgId,
          uid: walletGroup.uid
        }
      })
    }

    if (walletGroup.wallets.length) {
      await this.enroll(walletGroup.uid, walletGroup.wallets)
    }

    return walletGroup
  }

  async update(walletGroup: WalletGroupEntity): Promise<WalletGroupEntity> {
    if (walletGroup.wallets.length) {
      await this.enroll(walletGroup.uid, walletGroup.wallets)
    }

    return walletGroup
  }

  private async enroll(groupId: string, walletIds: string[]): Promise<boolean> {
    const members = walletIds.map((walletId) => ({
      walletId,
      groupId
    }))

    await this.prismaService.walletGroupMemberEntity.createMany({
      data: members,
      skipDuplicates: true
    })

    return true
  }

  async findById(uid: string): Promise<WalletGroupEntity | null> {
    const model = await this.prismaService.walletGroupEntity.findUnique({
      where: { uid },
      include: {
        members: true
      }
    })

    if (model) {
      return this.decode(model)
    }

    return null
  }

  async findByOrgId(orgId: string): Promise<WalletGroupEntity[]> {
    const models = await this.prismaService.walletGroupEntity.findMany({
      where: { orgId },
      include: {
        members: true
      }
    })

    return models.map(this.decode)
  }

  private decode(model: Model): WalletGroupEntity {
    return {
      uid: model.uid,
      wallets: map('walletId', model.members)
    }
  }
}
