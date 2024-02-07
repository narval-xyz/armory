import { Action } from '@narval/authz-shared'

export class ActionCriterionDto {
  // @IsDefined()
  // @ApiProperty()
  // criterion: typeof Criterion.CHECK_ACTION

  // @IsDefined()
  // @IsEnum(Action, { each: true })
  // @ApiProperty({ isArray: true, enum: Action })
  args: Action[]
}
