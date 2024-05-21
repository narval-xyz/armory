import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { Client, CreateClient } from '../../../core/type/client.type'

export class CreateClientRequestDto extends createZodDto(
  CreateClient.omit({
    policyEngine: true,
    createdAt: true,
    updatedAt: true
  }).extend({
    policyEngineNodes: z.array(z.string().url()).optional()
  })
) {}

export class CreateClientResponseDto extends createZodDto(Client) {}
