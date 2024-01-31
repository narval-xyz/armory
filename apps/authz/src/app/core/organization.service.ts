import { AdminRepository } from '@app/authz/app/persistence/repository/admin.repository'
import { CreateOrganizationRequest } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OrganizationService {
  constructor(private organizationRepository: AdminRepository) {}

  async createOrganization(payload: CreateOrganizationRequest) {
    // TODO: Verify authentication (user) & approval sig (engine)

    const { uid: organizationId, credential: rootCredential } = payload.request.organization

    const organization = await this.organizationRepository.createOrganization(organizationId, rootCredential)

    return {
      organization
    }
  }
}
