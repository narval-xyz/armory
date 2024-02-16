import { CredentialEntity, Entities } from '@narval/authz-shared'
import { HttpService } from '@nestjs/axios'
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { ORGANIZATION } from 'packages/authz-shared/src/lib/dev.fixture'
import { lastValueFrom, map, tap } from 'rxjs'

@Injectable()
export class EntityRepository implements OnApplicationBootstrap {
  private logger = new Logger(EntityRepository.name)

  private entities?: Entities

  constructor(private httpService: HttpService) {}

  fetch(orgId: string): Promise<Entities> {
    this.logger.log('Fetch organization entities', { orgId })

    return lastValueFrom(
      this.httpService
        .get<Entities>('http://localhost:3005/store/entities', {
          headers: {
            'x-org-id': orgId
          }
        })
        .pipe(
          map((response) => response.data),
          tap((entities) => {
            this.logger.log('Received entities snapshot', entities)
          })
        )
    )
  }

  getCredentialForPubKey(pubKey: string): CredentialEntity | null {
    if (this.entities) {
      return this.entities.credentials.find((cred) => cred.pubKey === pubKey) || null
    }

    return null
  }

  async onApplicationBootstrap() {
    // TODO (@wcalderipe, 15/02/24): Figure out where the organization will come
    // from. It depends on the deployment model: standalone engine per
    // organization or cluster with multi tenant.
    if (!this.entities) {
      const entities = await this.fetch(ORGANIZATION.uid)

      this.entities = entities
    }
  }
}
