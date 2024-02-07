import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, ValidateNested } from 'class-validator'
import { BaseActionDto } from '../base-action.dto'
import { BaseAdminRequestPayloadDto } from '../base-admin-request-payload.dto'
import { PolicyCriterionBuilderDto } from './policy-criterion-builder.dto'

export class SetPolicyRulesDto extends BaseActionDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.SET_POLICY_RULES
  })
  action: typeof Action.SET_POLICY_RULES

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  data: PolicyCriterionBuilderDto[]
}

export class SetPolicyRulesRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  request: SetPolicyRulesDto
}
