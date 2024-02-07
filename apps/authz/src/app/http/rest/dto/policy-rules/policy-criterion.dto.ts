import { Criterion } from '@narval/authz-shared'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsIn, ValidateNested } from 'class-validator'
import { ActionCriterionDto } from './criteria/action-criterion.dto'
import { ResourceIntegrityCriterionDto } from './criteria/resource-integrity-criterion.dto'

export class PolicyCriterionDto {
  @IsIn(Object.values(Criterion))
  @IsDefined()
  @ApiProperty({ enum: Object.values(Criterion) })
  criterion: Criterion

  @ValidateNested()
  @Type((opts) => {
    if (opts?.object.criterion === Criterion.CHECK_ACTION) {
      return ActionCriterionDto
    }
    if (opts?.object.criterion === Criterion.CHECK_RESOURCE_INTEGRITY) {
      return ResourceIntegrityCriterionDto
    }
  })
  @IsDefined()
  @ApiProperty({
    oneOf: [{ $ref: getSchemaPath(ActionCriterionDto) }, { $ref: getSchemaPath(ResourceIntegrityCriterionDto) }]
  })
  args: ActionCriterionDto | ResourceIntegrityCriterionDto
}
