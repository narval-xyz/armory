import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { PublicWallet } from '../../../../shared/type/domain.type'

export class GenerateKeyResponseDto extends createZodDto(
  z.object({
    wallet: PublicWallet,
    backup: z.string().optional(),
    keyId: z.string()
  })
) {}
