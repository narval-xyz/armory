import { ApprovalRequirement } from '@narval/policy-engine-shared'
import { z } from 'zod'
import { appSchema } from '../schema/app.schema'
import { tenantSchema } from '../schema/tenant.schema'

export type Tenant = z.infer<typeof tenantSchema>

export type App = z.infer<typeof appSchema>

export type MatchedRule = {
  policyName: string
  policyId: string
  type: 'permit' | 'forbid'
  approvalsSatisfied: ApprovalRequirement[]
  approvalsMissing: ApprovalRequirement[]
}

export type VerifiedApproval = {
  signature: string
  userId: string
  credentialId: string // The credential used for this approval
  address?: string // Address, if the Credential is a EOA private key TODO: Do we need this?
}
