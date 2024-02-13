import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsDefined, IsNotEmpty, IsString, Matches, ValidateNested } from 'class-validator'
import { Policy } from '../../../../../shared/types/policy.type'
import { BaseActionDto } from '../base-action.dto'
import { BaseAdminRequestPayloadDto } from '../base-admin-request-payload.dto'

export class SetPolicyRulesDto extends BaseActionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(Action.SET_POLICY_RULES)
  @ApiProperty()
  action: typeof Action.SET_POLICY_RULES

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Policy)
  @ApiProperty()
  data: Policy[]
}

export class SetPolicyRulesRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => SetPolicyRulesDto)
  @ApiProperty({ type: () => SetPolicyRulesDto })
  request: SetPolicyRulesDto
}
