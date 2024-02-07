import { Criterion } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn } from 'class-validator'

export class PolicyCriterionDto {
  @IsIn(Object.values(Criterion))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Criterion)
  })
  criterion: Criterion

  args: any
}
