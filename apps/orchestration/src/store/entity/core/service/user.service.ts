import { CredentialEntity, UserEntity, UserRole, UserWalletEntity } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { UserWalletRepository } from '../../persistence/repository/user-wallet.repository'
import { UserRepository } from '../../persistence/repository/user.repository'

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private userWalletRepository: UserWalletRepository
  ) {}

  create(orgId: string, user: UserEntity, credential?: CredentialEntity): Promise<UserEntity> {
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

  async assignWallet(orgId: string, assignment: UserWalletEntity): Promise<UserWalletEntity> {
    return this.userWalletRepository.create(orgId, assignment)
  }
}
