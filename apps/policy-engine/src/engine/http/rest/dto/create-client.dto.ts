import { createZodDto } from 'nestjs-zod'
import { CreateClient, PublicClient } from '../../../../shared/type/domain.type'

export class CreateClientRequestDto extends createZodDto(CreateClient) {}

export class CreateClientResponseDto extends createZodDto(PublicClient) {}
