import { CreateClient } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'
import { PublicClient } from '../../../../shared/type/domain.type'

export class CreateClientRequestDto extends createZodDto(CreateClient) {}

export class CreateClientResponseDto extends createZodDto(PublicClient) {}
