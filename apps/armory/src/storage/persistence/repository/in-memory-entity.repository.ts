import { Entities } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { EntityRepository } from '../../core/repository/entity.repository'

@Injectable()
export class InMemoryEntityRepository implements EntityRepository {
  private entities = new Map<string, Entities>()

  async put(orgId: string, entities: Entities): Promise<Entities> {
    this.entities.set(orgId, entities)

    return entities
  }

  async findByOrgId(orgId: string): Promise<Entities | null> {
    const entities = this.entities.get(orgId)

    return entities || null
  }
}
