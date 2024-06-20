import { SerializedAuthorizationRequest } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'

export class AuthorizationResponseDto extends createZodDto(SerializedAuthorizationRequest) {}
