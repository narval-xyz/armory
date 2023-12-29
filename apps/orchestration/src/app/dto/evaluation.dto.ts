import { ApiProperty } from '@nestjs/swagger'

export class EvaluationDto {
  @ApiProperty({ enum: ['forbidden', 'permitted'] })
  status: 'forbidden' | 'permitted'
}
