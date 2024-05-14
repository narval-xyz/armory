import { publicKeySchema } from '@narval/signature'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Client } from '../../../core/type/client.type'

export class CreateClientRequestDto extends createZodDto(
  z.object({
    clientName: z.string().min(1),
    policyStorePublicKey: publicKeySchema,
    entityStorePublicKey: publicKeySchema
  })
) {}

export class CreateClientResponseDto extends createZodDto(Client) {}
