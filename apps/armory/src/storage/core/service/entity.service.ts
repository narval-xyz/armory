import { Entities } from '@narval/policy-engine-shared'
import { Inject } from '@nestjs/common'
import { EntityRepository } from '../repository/entity.repository'

export class EntityService {
  constructor(@Inject(EntityRepository) private entityRepository: EntityRepository) {}

  put(orgId: string, data: { entities: Entities }): Promise<Entities> {
    return this.entityRepository.put(orgId, data.entities)
  }

  findByOrgId(orgId: string): Promise<Entities | null> {
    return this.entityRepository.findByOrgId(orgId)
  }
}
