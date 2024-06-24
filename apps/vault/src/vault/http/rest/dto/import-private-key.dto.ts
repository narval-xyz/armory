import { hexSchema } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

// TODO: Refine the validation: either privateKey or encryptedKey must be
// present
export class ImportPrivateKeyDto extends createZodDto(
  z.object({
    privateKey: hexSchema.optional().describe('Account Private Key, unencrypted'),
    encryptedPrivateKey: z
      .string()
      .optional()
      .describe('Account Private Key encrypted with JWE. Header MUST include "kid"'),
    accountId: z.string().optional().describe('If not provided, it will be derived as "eip155:eoa:${address}"')
  })
) {}
