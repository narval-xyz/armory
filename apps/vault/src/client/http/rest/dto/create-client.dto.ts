import { CreateClientInput } from '../../../../shared/type/domain.type'
import { createZodDto } from 'nestjs-zod'

export class CreateClientDto extends createZodDto(CreateClientInput) {}
