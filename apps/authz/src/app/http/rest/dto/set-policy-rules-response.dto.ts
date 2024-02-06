import { PolicyCriterionBuilder } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'
import { PolicyCriterionBuilderDto } from './policy-criterion-builder.dto'

export class SetPolicyRulesResponseDto {
  constructor(policyRules: PolicyCriterionBuilder[]) {
    this.policyRules = policyRules.map((rule) => new PolicyCriterionBuilderDto(rule))
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  policyRules: PolicyCriterionBuilderDto[]
}
