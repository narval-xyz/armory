import { PublicWallet } from '@narval/armory-sdk'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class GenerateKeyResponseDto extends createZodDto(
  z.object({
    wallet: PublicWallet,
    backup: z.string().optional(),
    keyId: z.string()
  })
) {}
