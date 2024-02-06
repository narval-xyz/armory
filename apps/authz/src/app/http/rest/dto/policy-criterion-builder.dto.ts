import { PolicyCriterion, PolicyCriterionBuilder, Then } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsString, ValidateNested } from 'class-validator'

export class PolicyCriterionBuilderDto {
  constructor(data: PolicyCriterionBuilder) {
    this.name = data.name
    this.when = data.when
    this.then = data.then
  }

  @IsString()
  @IsDefined()
  @ApiProperty()
  name: string

  @IsString()
  @ValidateNested()
  @ApiProperty()
  when: PolicyCriterion[]

  @IsIn(Object.values(Then))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Then),
    default: Then.FORBID
  })
  then: Then
}
