import {
  CreateOrganizationRequest,
  CredentialEntity,
  OrganizationEntity,
  UserEntity,
  UserRole
} from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { OrganizationRepository } from '../../persistence/repository/organization.repository'
import { UserRepository } from '../../persistence/repository/user.repository'

@Injectable()
export class OrganizationService {
  constructor(
    private orgRepository: OrganizationRepository,
    private userRepository: UserRepository
  ) {}

  async create(input: CreateOrganizationRequest): Promise<{
    organization: OrganizationEntity
    rootUser: UserEntity
    rootCredential: CredentialEntity
  }> {
    const { uid, credential } = input.request.organization

    const rootUser: UserEntity = {
      uid: credential.userId,
      role: UserRole.ROOT
    }

    await this.userRepository.create(uid, rootUser, credential)

    const organization = await this.orgRepository.create(uid)

    return {
      organization,
      rootUser,
      rootCredential: credential
    }
  }
}
