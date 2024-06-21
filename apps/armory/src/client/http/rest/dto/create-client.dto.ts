import { createZodDto } from 'nestjs-zod'
import { CreateClientInput, PublicClient } from '../../../core/type/client.type'

export class CreateClientRequestDto extends createZodDto(CreateClientInput) {}

export class CreateClientResponseDto extends createZodDto(PublicClient) {}
