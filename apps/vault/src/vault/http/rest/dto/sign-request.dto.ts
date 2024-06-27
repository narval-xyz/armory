import { SerializedSignableRequest } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class SignRequestDto extends createZodDto(
  z.object({
    request: SerializedSignableRequest
  })
) {}
