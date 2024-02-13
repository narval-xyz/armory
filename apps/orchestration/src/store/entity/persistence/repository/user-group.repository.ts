import { UserGroupEntity } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../../shared/module/persistence/service/prisma.service'

@Injectable()
export class UserGroupRepository {
  constructor(private prismaService: PrismaService) {}

  async create(orgId: string, userGroup: UserGroupEntity): Promise<UserGroupEntity> {
    await this.prismaService.userGroupEntity.create({
      data: {
        orgId,
        uid: userGroup.uid
      }
    })

    if (userGroup.users.length) {
      await this.enroll(userGroup.uid, userGroup.users)
    }

    return userGroup
  }

  async update(userGroup: UserGroupEntity): Promise<UserGroupEntity> {
    if (userGroup.users.length) {
      await this.enroll(userGroup.uid, userGroup.users)
    }

    return userGroup
  }

  private async enroll(groupId: string, userIds: string[]): Promise<boolean> {
    try {
      const memberships = userIds.map((userId) => ({
        user: userId,
        group: groupId
      }))

      await this.prismaService.userGroupEntityMembership.createMany({
        data: memberships,
        skipDuplicates: true
      })
      return true
    } catch (error) {
      return false
    }
  }

  async findById(uid: string): Promise<UserGroupEntity | null> {
    const group = await this.prismaService.userGroupEntity.findUnique({
      where: { uid }
    })

    if (group) {
      const users = await this.prismaService.userGroupEntityMembership.findMany({
        where: { group: uid }
      })

      return {
        ...group,
        users: users.map(({ user }) => user)
      }
    }

    return null
  }
}
