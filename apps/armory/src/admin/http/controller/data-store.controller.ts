import { Entities, Policy } from '@narval/policy-engine-shared'
import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { OrgId } from '../../../shared/decorator/org-id.decorator'
import { DataStoreService } from '../../core/service/data-store.service'

@Controller('/data-store')
@ApiTags('Data Store')
export class DataStoreController {
  constructor(private dataStoreService: DataStoreService) {}

  @Get('/entities')
  getEntities(@OrgId() orgId: string) {
    console.log('orgId', orgId)
    return this.dataStoreService.getEntities(orgId)
  }

  @Get('/policies')
  getPolicies(@OrgId() orgId: string) {
    return this.dataStoreService.getPolicies(orgId)
  }

  @Post('/entities')
  setEntities(@OrgId() orgId: string, @Body() body: Entities) {
    return this.dataStoreService.setEntities(orgId, body)
  }

  @Post('/policies')
  setPolicies(@OrgId() orgId: string, @Body() body: Policy[]) {
    return this.dataStoreService.setPolicies(orgId, body)
  }
}
