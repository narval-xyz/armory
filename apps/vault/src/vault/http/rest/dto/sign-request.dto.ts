import {
  SignMessageAction,
  SignRawAction,
  SignTransactionAction,
  SignTypedDataAction
} from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class SignRequestDto extends createZodDto(
  z.object({
    request: z.union([SignTransactionAction, SignMessageAction, SignTypedDataAction, SignRawAction])
  })
) {}
