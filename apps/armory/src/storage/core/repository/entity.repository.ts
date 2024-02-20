import { Entities } from '@narval/policy-engine-shared'

export const EntityRepository = Symbol('Storage:EntityRepository')

export interface EntityRepository {
  put(orgId: string, entities: Entities): Promise<Entities>
  findByOrgId(orgId: string): Promise<Entities | null>
}
