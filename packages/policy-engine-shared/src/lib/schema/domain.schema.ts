import { z } from 'zod'
import { EntityType } from '../type/domain.type'

export const approvalRequirementSchema = z.object({
  approvalCount: z.number().min(0),
  /**
   * The number of requried approvals
   */
  approvalEntityType: z.nativeEnum(EntityType),
  /**
   * List of entities IDs that must satisfy the requirements.
   */
  entityIds: z.array(z.string()),
  countPrincipal: z.boolean()
})
