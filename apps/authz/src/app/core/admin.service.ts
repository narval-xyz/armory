import { AdminRepository } from '@app/authz/app/persistence/repository/admin.repository'
import { Organization, User } from '@app/authz/shared/types/entities.types'
import { Alg, AuthCredential, CreateOrganizationRequest, CreateUserRequest } from '@narval/authz-shared'
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
      rootCredential: {
        kid: data.rootCredential.uid,
        pubKey: data.rootCredential.pubKey,
        alg: data.rootCredential.alg as Alg, // TODO: don't do this "as"
        userId: data.rootCredential.userId
      }
    }
  }

  async createUser(payload: CreateUserRequest) {
    const { uid, role, credential } = payload.request.user
    const user = await this.adminRepository.createUser(uid, role, credential)

    return user
  }
}
