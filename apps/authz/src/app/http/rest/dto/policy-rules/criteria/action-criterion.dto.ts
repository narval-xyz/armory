import { Action, Criterion } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum } from 'class-validator'

export class ActionCriterionDto {
  @IsDefined()
  @ApiProperty()
  criterion: typeof Criterion.CHECK_ACTION

  @IsDefined()
  @IsEnum(Action, { each: true })
  @ApiProperty({ isArray: true, enum: Action })
  args: Action[]
}
