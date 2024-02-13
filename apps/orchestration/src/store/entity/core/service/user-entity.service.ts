import { AuthCredential, UserEntity, UserRole } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { UserGroupRepository } from '../../persistence/repository/user-group.repository'
import { UserRepository } from '../../persistence/repository/user.repository'

@Injectable()
export class UserEntityService {
  constructor(private userRepository: UserRepository, private userGroupRepository: UserGroupRepository) {}

  create(orgId: string, user: UserEntity, credential?: AuthCredential): Promise<UserEntity> {
    return this.userRepository.create(orgId, user, credential)
  }

  delete(uid: string): Promise<boolean> {
    return this.userRepository.delete(uid)
  }

  async grantRole(uid: string, role: UserRole): Promise<UserEntity> {
    return this.userRepository.update({
      uid,
      role
    })
  }

  async enroll(orgId: string, userId: string, groupId: string): Promise<boolean> {
    const group = await this.userGroupRepository.findById(groupId)

    if (group) {
      await this.userGroupRepository.enroll({
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
