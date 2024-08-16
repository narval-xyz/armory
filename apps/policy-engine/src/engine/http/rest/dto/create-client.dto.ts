import { CreateClient, PublicClient } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'

export class CreateClientRequestDto extends createZodDto(CreateClient) {}

export class CreateClientResponseDto extends createZodDto(PublicClient) {}
