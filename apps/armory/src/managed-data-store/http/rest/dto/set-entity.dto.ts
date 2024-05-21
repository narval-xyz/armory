import { EntityStore } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'

export class SetEntityDto extends createZodDto(EntityStore) {}
