import { CreateCredentialRequest, CredentialEntity } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { CredentialRepository } from '../../persistence/repository/credential.repository'

@Injectable()
export class CredentialService {
  constructor(private credentialRepository: CredentialRepository) {}

  create(orgId: string, data: CreateCredentialRequest): Promise<CredentialEntity> {
    return this.credentialRepository.create(orgId, data.request.credential)
  }
}
