import { Action, BaseActionDto, BaseActionRequestDto } from '@narval/policy-engine-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsDefined, Matches, ValidateNested } from 'class-validator'
import { Policy } from '../../../../../shared/type/policy.type'

export class SetPolicyRulesDto extends BaseActionDto {
  @Matches(Action.SET_POLICY_RULES)
  @ApiProperty({
    enum: [Action.SET_POLICY_RULES],
    default: Action.SET_POLICY_RULES
  })
  action: typeof Action.SET_POLICY_RULES

  @ArrayNotEmpty()
  @Type(() => Policy)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [Policy] })
  data: Policy[]
}

export class SetPolicyRulesRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => SetPolicyRulesDto)
  @ApiProperty()
  request: SetPolicyRulesDto
}
