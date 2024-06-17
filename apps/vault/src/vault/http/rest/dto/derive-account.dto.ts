import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PublicAccount } from '../../../../shared/type/domain.type'

export class DeriveAccountDto extends createZodDto(
  z.object({
    keyId: z.string(),
    derivationPaths: z
      .array(
        z.string().startsWith('m', {
          message: `Derivation path must start with 'm'`
        })
      )
      .optional(),
    count: z.number().default(1)
  })
) {}

export class DeriveAccountResponseDto extends createZodDto(
  z.object({
    accounts: z.array(PublicAccount)
  })
) {}
