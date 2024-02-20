import { Body, Controller, Get, Put } from '@nestjs/common'
import { OrgId } from '../../../../shared/decorator/org-id.decorator'
import { EntityService } from '../../../core/service/entity.service'
import { UpdateEntitiesRequestDto } from '../dto/update-entities-request.dto'

@Controller('/storage')
export class StorageController {
  constructor(private entityService: EntityService) {}

  @Put('/entities')
  async putEntities(@OrgId() orgId: string, @Body() body: UpdateEntitiesRequestDto) {
    const entities = await this.entityService.put(orgId, body)

    return { entities }
  }

  @Get('/entities')
  async getEntities(@OrgId() orgId: string) {
    const entities = await this.entityService.findByOrgId(orgId)

    return { entities }
  }
}
