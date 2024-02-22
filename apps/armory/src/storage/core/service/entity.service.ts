import { Entities, EntityUtil } from '@narval/policy-engine-shared'
import { Inject } from '@nestjs/common'
import { EntityValidationException } from '../exception/entity-validation.exception'
import { EntityRepository } from '../repository/entity.repository'

export class EntityService {
  constructor(@Inject(EntityRepository) private entityRepository: EntityRepository) {}

  async put(orgId: string, data: { entities: Entities }): Promise<Entities> {
    const result = EntityUtil.validate(data.entities)

    if (result.success) {
      return this.entityRepository.put(orgId, data.entities)
    }

    throw new EntityValidationException(result.issues)
  }

  findByOrgId(orgId: string): Promise<Entities | null> {
    return this.entityRepository.findByOrgId(orgId)
  }
}
