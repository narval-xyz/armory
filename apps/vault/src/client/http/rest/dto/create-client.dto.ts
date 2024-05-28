import { createZodDto } from 'nestjs-zod'
import { CreateClientInput } from '../../../../shared/type/domain.type'

export class CreateClientDto extends createZodDto(CreateClientInput) {}
