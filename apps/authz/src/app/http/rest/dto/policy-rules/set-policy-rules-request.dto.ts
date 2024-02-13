import { Action, BaseActionDto, BaseAdminRequestPayloadDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsDefined, IsString, Matches, ValidateNested } from 'class-validator'
import { Policy } from '../../../../../shared/types/policy.type'

export class SetPolicyRulesDto extends BaseActionDto {
  @IsDefined()
  @IsString()
  @Matches(Action.SET_POLICY_RULES)
  @ApiProperty()
  action: typeof Action.SET_POLICY_RULES

  @IsDefined()
  @IsArray()
  @Type(() => Policy)
  @ValidateNested({ each: true })
  @ApiProperty()
  data: Policy[]
}

export class SetPolicyRulesRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => SetPolicyRulesDto)
  @ApiProperty()
  request: SetPolicyRulesDto
}
