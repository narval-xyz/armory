import { Criterion } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined } from 'class-validator'

export class ResourceIntegrityCriterionDto {
  @IsDefined()
  @ApiProperty()
  criterion: typeof Criterion.CHECK_RESOURCE_INTEGRITY

  @ApiProperty()
  args: null
}
