import { CreateCredentialRequest, CredentialEntity } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { CredentialRepository } from '../../persistence/repository/credential.repository'

@Injectable()
export class CredentialService {
  constructor(private credentialRepository: CredentialRepository) {}

  create(orgId: string, request: CreateCredentialRequest): Promise<CredentialEntity> {
    return this.credentialRepository.create(orgId, request.request.credential)
  }
}
