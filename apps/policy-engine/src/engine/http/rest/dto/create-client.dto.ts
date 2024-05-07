import { DataStoreConfiguration } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export class CreateClientDto extends createZodDto(
  z.object({
    clientId: z.string().optional(),
    entityDataStore: DataStoreConfiguration,
    policyDataStore: DataStoreConfiguration
  })
) {}
