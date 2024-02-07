import { PolicyCriterionBuilder, Then } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsIn, IsString, ValidateNested } from 'class-validator'
import { PolicyCriterionDto } from './policy-criterion.dto'

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
}
