import { ApiProperty } from '@nestjs/swagger'

export class ResourceIntegrityCriterionDto {
  // @IsDefined()
  // @ApiProperty()
  // criterion: typeof Criterion.CHECK_RESOURCE_INTEGRITY

  @ApiProperty()
  args: null
}
