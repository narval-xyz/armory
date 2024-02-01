import { AdminRepository } from '@app/authz/app/persistence/repository/admin.repository'
import { Organization, User, Wallet } from '@app/authz/shared/types/entities.types'
import {
  AuthCredential,
  CreateOrganizationRequest,
  CreateUserRequest,
  RegisterWalletRequest
} from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AdminService {
  constructor(private adminRepository: AdminRepository) {}

  async createOrganization(payload: CreateOrganizationRequest): Promise<{
    organization: Organization
    rootUser: User
    rootCredential: AuthCredential
  }> {
    // TODO: Verify authentication (user) & approval sig (engine)

    const { uid: organizationId, credential: rootCredential } = payload.request.organization

    const data = await this.adminRepository.createOrganization(organizationId, rootCredential)

    // TODO: return api key?
    return {
      organization: data.organization,
      rootUser: data.rootUser,
      rootCredential: data.rootCredential
    }
  }

  async createUser(payload: CreateUserRequest): Promise<User> {
    const { uid, role, credential } = payload.request.user
    const user = await this.adminRepository.createUser(uid, role, credential)

    return user
  }

  async registerWallet(payload: RegisterWalletRequest): Promise<Wallet> {
    const { uid, address, accountType, chainId } = payload.request.wallet
    await this.adminRepository.registerWallet(uid, address, accountType, chainId)

    return payload.request.wallet
  }
}
