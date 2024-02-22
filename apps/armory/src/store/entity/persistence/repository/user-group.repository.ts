import { UserGroupEntity } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { UserGroupEntity as GroupModel, UserGroupMemberEntity as MemberModel } from '@prisma/client/armory'
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

    return userGroup
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
    return { uid: model.uid }
  }
}
