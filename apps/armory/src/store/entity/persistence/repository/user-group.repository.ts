import { UserGroupEntity } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { UserGroupEntity as GroupModel, UserGroupMemberEntity as MemberModel } from '@prisma/client/orchestration'
import { map } from 'lodash/fp'
import { PrismaService } from '../../../../shared/module/persistence/service/prisma.service'

type Model = GroupModel & {
  members: MemberModel[]
}

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
    const members = userIds.map((userId) => ({ userId, groupId }))

    await this.prismaService.userGroupMemberEntity.createMany({
      data: members,
      skipDuplicates: true
    })

    return true
  }

  async findById(uid: string): Promise<UserGroupEntity | null> {
    const model = await this.prismaService.userGroupEntity.findUnique({
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

  async findByOrgId(orgId: string): Promise<UserGroupEntity[]> {
    const models = await this.prismaService.userGroupEntity.findMany({
      where: { orgId },
      include: {
        members: true
      }
    })

    return models.map(this.decode)
  }

  private decode(model: Model): UserGroupEntity {
    return {
      uid: model.uid,
      users: map('userId', model.members)
    }
  }
}
