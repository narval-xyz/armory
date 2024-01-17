import { ApiProperty } from '@nestjs/swagger'

export class EvaluationDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  decision: string

  @ApiProperty({
    type: String
  })
  signature?: string | null

  @ApiProperty()
  createdAt: Date
}
