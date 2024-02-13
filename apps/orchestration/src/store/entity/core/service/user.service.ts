import { AuthCredential, UserEntity, UserRole, UserWallet } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { UserWalletRepository } from '../../persistence/repository/user-wallet.repository'
import { UserRepository } from '../../persistence/repository/user.repository'

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository, private userWalletRepository: UserWalletRepository) {}

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

  async assignWallet(assignment: UserWallet): Promise<UserWallet> {
    return this.userWalletRepository.assign(assignment)
  }
}
