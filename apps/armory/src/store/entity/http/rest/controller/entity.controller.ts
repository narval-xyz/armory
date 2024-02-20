import { Controller, Get, HttpStatus } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { REQUEST_HEADER_ORG_ID } from '../../../../../armory.constant'
import { OrgId } from '../../../../../shared/decorator/org-id.decorator'
import { EntityService } from '../../../core/service/entity.service'
import { API_PREFIX, API_TAG } from '../../../entity-store.constant'
import { EntitiesDto } from '../dto/entities.dto'

@Controller(`${API_PREFIX}/entities`)
@ApiTags(API_TAG)
export class EntityController {
  constructor(private entityService: EntityService) {}

  @Get()
  @ApiOperation({
    summary: "Returns the organization's entities"
  })
  @ApiHeader({
    name: REQUEST_HEADER_ORG_ID
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: EntitiesDto
  })
  async getEntities(@OrgId() orgId: string): Promise<EntitiesDto> {
    const entities = await this.entityService.getEntities(orgId)

    return new EntitiesDto(entities)
  }
}
