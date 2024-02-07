import { Criterion } from '@narval/authz-shared'

export class PolicyCriterionDto {
  // @IsIn(Object.values(Criterion))
  // @IsDefined()
  // @ApiProperty({ enum: Object.values(Criterion) })
  criterion: Criterion

  // @ValidateNested()
  // @Type((opts) => {
  //   switch (opts?.object.criterion) {
  //     case Criterion.CHECK_ACTION:
  //       return ActionCriterionDto
  //     case Criterion.CHECK_RESOURCE_INTEGRITY:
  //       return ResourceIntegrityCriterionDto
  //     default:
  //       throw Error('boom, sam change in the future')
  //   }
  // })
  // @IsDefined()
  // @ApiProperty({
  //   oneOf: [{ $ref: getSchemaPath(ActionCriterionDto) }, { $ref: getSchemaPath(ResourceIntegrityCriterionDto) }]
  // })
  // args: ActionCriterionDto | ResourceIntegrityCriterionDto
}
