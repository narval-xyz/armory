import { BaseActionDto } from '@app/authz/app/http/rest/dto/base-action.dto'
import { BaseAdminRequestPayloadDto } from '@app/authz/app/http/rest/dto/base-admin-request-payload.dto'
import { Action, Policy } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsDefined, IsString, Matches, ValidateNested } from 'class-validator'

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
