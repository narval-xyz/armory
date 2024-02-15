import { Injectable } from '@nestjs/common'
import { UserGroupRepository } from '../../persistence/repository/user-group.repository'

@Injectable()
export class UserGroupService {
  constructor(private userGroupRepository: UserGroupRepository) {}

  async assign(orgId: string, userId: string, groupId: string): Promise<boolean> {
    const group = await this.userGroupRepository.findById(groupId)

    if (group) {
      await this.userGroupRepository.update({
        ...group,
        users: group.users.concat(userId)
      })
    } else {
      await this.userGroupRepository.create(orgId, {
        uid: groupId,
        users: [userId]
      })
    }

    return true
  }
}
