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
        ...userGroup
      }
    })

    await this.enroll(userGroup)

    return userGroup
  }

  async enroll(userGroup: UserGroupEntity): Promise<UserGroupEntity> {
    if (userGroup.users.length) {
      const memberships = userGroup.users.map((userId) => ({
        user: userId,
        group: userGroup.uid
      }))

      await this.prismaService.userGroupEntityMembership.createMany({
        data: memberships,
        skipDuplicates: true
      })
    }

    return userGroup
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
