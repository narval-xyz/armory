import { Entities, EntityStore, JwtString, Policy, PolicyStore } from '@narval/policy-engine-shared'
import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { OrgId } from '../../../shared/decorator/org-id.decorator'
import { EntityDataStoreService } from '../../core/service/entity-data-store.service'
import { PolicyDataStoreService } from '../../core/service/policy-data-store.service'

@Controller('/managed-data-store')
@ApiTags('Managed Data Store')
export class DataStoreController {
  constructor(
    private entityDataStoreService: EntityDataStoreService,
    private policyDataStoreService: PolicyDataStoreService
  ) {}

  @Get('/entities')
  getEntities(@OrgId() orgId: string): Promise<{ entity: EntityStore } | null> {
    return this.entityDataStoreService.getEntities(orgId)
  }

  @Get('/policies')
  getPolicies(@OrgId() orgId: string): Promise<{ policy: PolicyStore } | null> {
    return this.policyDataStoreService.getPolicies(orgId)
  }

  @Post('/entities')
  setEntities(@OrgId() orgId: string, @Body() payload: { signature: JwtString; data: Entities }) {
    return this.entityDataStoreService.setEntities({
      orgId,
      payload
    })
  }

  @Post('/policies')
  setPolicies(@OrgId() orgId: string, @Body() payload: { signature: JwtString; data: Policy[] }) {
    return this.policyDataStoreService.setPolicies({
      orgId,
      payload
    })
  }
}
