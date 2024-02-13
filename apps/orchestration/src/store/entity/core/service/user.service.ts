import { AuthCredential, UserEntity, UserRole } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { UserRepository } from '../../persistence/repository/user.repository'

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

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
}
