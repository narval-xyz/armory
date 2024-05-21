import { PolicyStore } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'

export class SetPolicyDto extends createZodDto(PolicyStore) {}
