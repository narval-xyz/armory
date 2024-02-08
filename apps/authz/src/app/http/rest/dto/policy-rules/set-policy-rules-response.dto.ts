import { Policy } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, ValidateNested } from 'class-validator'

export class SetPolicyRulesResponseDto {
  @IsDefined()
  @Type(() => Policy)
  @ValidateNested()
  @ApiProperty({ type: () => Policy, isArray: true })
  policyRules: Policy[]

  constructor(partial: Partial<SetPolicyRulesResponseDto>) {
    Object.assign(this, partial)
  }
}
