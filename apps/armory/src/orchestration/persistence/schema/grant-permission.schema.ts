import { Action } from '@narval/policy-engine-shared'
import { z } from 'zod'

export const readGrantPermissionSchema = z.object({
  action: z.literal(Action.GRANT_PERMISSION),
  nonce: z.string(),
  resourceId: z.string(),
  permissions: z.array(z.string())
})

export const createGrantPermissionSchema = readGrantPermissionSchema
