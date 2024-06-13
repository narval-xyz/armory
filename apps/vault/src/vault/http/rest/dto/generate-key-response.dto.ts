import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { _OLD_PUBLIC_WALLET_ } from '../../../../shared/type/domain.type'

export class GenerateKeyResponseDto extends createZodDto(
  z.object({
    _OLD_WALLET_: _OLD_PUBLIC_WALLET_,
    backup: z.string().optional(),
    keyId: z.string()
  })
) {}
