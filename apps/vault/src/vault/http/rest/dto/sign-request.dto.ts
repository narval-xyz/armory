import { createZodDto } from 'nestjs-zod'
import { SerializedSignableRequest } from 'packages/policy-engine-shared/src/lib/type/action.type'
import { z } from 'zod'

export class SignRequestDto extends createZodDto(
  z.object({
    request: SerializedSignableRequest
  })
) {}
