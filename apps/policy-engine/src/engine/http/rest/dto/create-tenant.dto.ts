import { dataStoreConfigurationSchema } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const createTenantSchema = z.object({
  clientId: z.string().optional(),
  entityDataStore: dataStoreConfigurationSchema,
  policyDataStore: dataStoreConfigurationSchema
})

export class CreateTenantDto extends createZodDto(createTenantSchema) {}
