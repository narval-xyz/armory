import { createZodDto } from 'nestjs-zod'
import {
  SignMessageAction,
  SignRawAction,
  SignTransactionAction,
  SignTypedDataAction
} from 'packages/policy-engine-shared/src/lib/type/action.type'
import { z } from 'zod'

export class SignRequestDto extends createZodDto(
  z.object({
    request: z.union([SignTransactionAction, SignMessageAction, SignTypedDataAction, SignRawAction])
  })
) {}
