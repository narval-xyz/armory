import { BaseActionDto } from '@app/authz/app/http/rest/dto/base-action.dto'
import { BaseAdminRequestPayloadDto } from '@app/authz/app/http/rest/dto/base-admin-request-payload.dto'
import { Action, Policy } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsString, Matches, ValidateNested } from 'class-validator'

export class SetPolicyRulesDto extends BaseActionDto {
  @IsDefined()
  @IsString()
  @Matches(Action.SET_POLICY_RULES)
  @ApiProperty({ type: Action, default: Action.SET_POLICY_RULES })
  action: typeof Action.SET_POLICY_RULES

  @IsDefined()
  @Type(() => Policy)
  @ValidateNested({ each: true })
  @ApiProperty({ type: Policy, isArray: true })
  data: Policy[]
}

export class SetPolicyRulesRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => SetPolicyRulesDto)
  @ApiProperty()
  request: SetPolicyRulesDto
}
