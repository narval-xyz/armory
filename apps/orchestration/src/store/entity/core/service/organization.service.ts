import { CredentialEntity, OrganizationEntity, UserEntity, UserRole } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { OrganizationRepository } from '../../persistence/repository/organization.repository'
import { UserService } from './user.service'

@Injectable()
export class OrganizationService {
  constructor(
    private orgRepository: OrganizationRepository,
    private userService: UserService
  ) {}

  async create(input: { uid: string; rootCredential: CredentialEntity }): Promise<{
    organization: OrganizationEntity
    rootUser: UserEntity
    rootCredential: CredentialEntity
  }> {
    const { uid, rootCredential } = input

    const rootUser: UserEntity = {
      uid: input.rootCredential.userId,
      role: UserRole.ROOT
    }

    await this.userService.create(uid, rootUser, input.rootCredential)

    const organization = await this.orgRepository.create(uid)

    return {
      organization,
      rootUser,
      rootCredential
    }
  }
}
