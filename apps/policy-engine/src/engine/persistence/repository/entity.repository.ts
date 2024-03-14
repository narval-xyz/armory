import { CredentialEntity, Entities, FIXTURE } from '@narval/policy-engine-shared'
import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class EntityRepository {
  private logger = new Logger(EntityRepository.name)

  constructor(private httpService: HttpService) {}

  async fetch(orgId: string): Promise<Entities> {
    this.logger.log('Fetch organization entities', { orgId })

    return FIXTURE.ENTITIES
  }

  getCredentialForPubKey(pubKey: string): CredentialEntity | null {
    return FIXTURE.ENTITIES.credentials.find((cred) => cred.pubKey === pubKey) || null
  }
  getCredential(id: string): CredentialEntity | null {
    return FIXTURE.ENTITIES.credentials.find((cred) => cred.id === id) || null
  }
}
