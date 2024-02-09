import { Policy } from '../../../../../shared/types/policy.type';
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsString, ValidateNested } from 'class-validator'

export class SetPolicyRulesResponseDto {
  @IsDefined()
  @IsString()
  fileId: string

  @IsDefined()
  @Type(() => Policy)
  @ValidateNested()
  @ApiProperty({ type: () => Policy, isArray: true })
  policies: Policy[]

  constructor(partial: Partial<SetPolicyRulesResponseDto>) {
    Object.assign(this, partial)
  }
}
