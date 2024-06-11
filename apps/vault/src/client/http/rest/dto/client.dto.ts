import { createZodDto } from 'nestjs-zod'
import { Client } from '../../../../shared/type/domain.type'

export class ClientDto extends createZodDto(Client) {}
