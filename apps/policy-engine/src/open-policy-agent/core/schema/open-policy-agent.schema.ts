import { ApprovalRequirement } from '@narval/policy-engine-shared'
import { z } from 'zod'

export const resultSchema = z.object({
  default: z.boolean().optional(),
  permit: z.boolean(),
  reasons: z
    .array(
      z.object({
        policyName: z.string(),
        policyId: z.string(),
        type: z.enum(['permit', 'forbid']),
        approvalsSatisfied: z.array(ApprovalRequirement),
        approvalsMissing: z.array(ApprovalRequirement)
      })
    )
    .optional()
})
