import { PolicyCriterionDto } from '@app/authz/app/http/rest/dto/policy-rules/policy-criterion.dto'
import { Then } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsIn, IsString, ValidateNested } from 'class-validator'

export class PolicyDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  name: string

  @ValidateNested()
  @Type(() => PolicyCriterionDto)
  @ApiProperty({
    type: () => PolicyCriterionDto,
    isArray: true
  })
  when: PolicyCriterionDto[]

  @IsIn(Object.values(Then))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Then),
    default: Then.FORBID
  })
  then: Then

  constructor(partial: Partial<PolicyDto>) {
    Object.assign(this, partial)
  }
}
