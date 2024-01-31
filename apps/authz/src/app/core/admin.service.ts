import { AdminRepository } from '@app/authz/app/persistence/repository/admin.repository'
import { CreateOrganizationRequest, CreateUserRequest } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AdminService {
  constructor(private adminRepository: AdminRepository) {}

  async createOrganization(payload: CreateOrganizationRequest) {
    // TODO: Verify authentication (user) & approval sig (engine)

    const { uid: organizationId, credential: rootCredential } = payload.request.organization

    const organization = await this.adminRepository.createOrganization(organizationId, rootCredential)

    // TODO: return api key?
    return {
      organization
    }
  }

  async createUser(payload: CreateUserRequest) {
    const { uid, role, credential } = payload.request.user
    const user = await this.adminRepository.createUser(uid, role, credential)

    return user
  }
}
