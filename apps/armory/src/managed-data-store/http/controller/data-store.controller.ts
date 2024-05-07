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
  async getEntities(@OrgId() orgId: string): Promise<{ entity: EntityStore } | null> {
    const entity = await this.entityDataStoreService.getEntities(orgId)
    return entity ? { entity } : null
  }

  @Get('/policies')
  async getPolicies(@OrgId() orgId: string): Promise<{ policy: PolicyStore } | null> {
    const policy = await this.policyDataStoreService.getPolicies(orgId)
    return policy ? { policy } : null
  }

  @Post('/entities')
  setEntities(@OrgId() orgId: string, @Body() payload: { signature: JwtString; data: Entities }) {
    return this.entityDataStoreService.setEntities(orgId, payload)
  }

  @Post('/policies')
  setPolicies(@OrgId() orgId: string, @Body() payload: { signature: JwtString; data: Policy[] }) {
    return this.policyDataStoreService.setPolicies(orgId, payload)
  }
}
