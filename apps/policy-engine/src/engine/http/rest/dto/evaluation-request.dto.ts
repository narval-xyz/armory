import { EvaluationRequest } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'

export class EvaluationRequestDto extends createZodDto(EvaluationRequest) {}
