import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsDefined, IsString, ValidateNested } from 'class-validator'
import { Policy } from '../../../../../shared/types/policy.type'

export class SetPolicyRulesResponseDto {
  @IsDefined()
  @IsString()
  fileId: string

  @ArrayNotEmpty()
  @Type(() => Policy)
  @ValidateNested({ each: true })
  @ApiProperty({ type: [Policy] })
  policies: Policy[]

  constructor(partial: Partial<SetPolicyRulesResponseDto>) {
    Object.assign(this, partial)
  }
}
