import { Type } from 'class-transformer'
import { IsDefined, ValidateNested } from 'class-validator'
import { EntitiesDto } from './entities.dto'

export class UpdateEntitiesRequestDto {
  @IsDefined()
  @Type(() => EntitiesDto)
  @ValidateNested()
  entities: EntitiesDto
}
