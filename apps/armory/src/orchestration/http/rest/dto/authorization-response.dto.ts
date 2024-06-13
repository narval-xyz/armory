import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import {
  AuthorizationRequest,
  GrantPermission,
  SerializedSignTransaction,
  SignMessage
} from '../../../core/type/domain.type'

export class AuthorizationResponseDto extends createZodDto(
  AuthorizationRequest.extend({
    // Overrides the request to replace `SignTransaction` by
    // `SerializedSignTransaction` to ensure BigInt is coerce to string.
    request: z.discriminatedUnion('action', [SerializedSignTransaction, SignMessage, GrantPermission])
  })
) {}
