import { SerializedEvaluationResponse } from '@narval/policy-engine-shared'
import { createZodDto } from 'nestjs-zod'

export class SerializedEvaluationResponseDto extends createZodDto(SerializedEvaluationResponse) {}
