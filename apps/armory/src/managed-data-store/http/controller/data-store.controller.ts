import { Entities, EntityStore, JwtString, Policy, PolicyStore } from '@narval/policy-engine-shared'
import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { EntityDataStoreService } from '../../core/service/entity-data-store.service'
import { PolicyDataStoreService } from '../../core/service/policy-data-store.service'

@Controller('/data')
@ApiTags('Managed Data Store')
export class DataStoreController {
  constructor(
    private entityDataStoreService: EntityDataStoreService,
    private policyDataStoreService: PolicyDataStoreService
  ) {}

  @Get('/entities')
  async getEntities(@Query('clientId') clientId: string): Promise<{ entity: EntityStore } | null> {
    const entity = await this.entityDataStoreService.getEntities(clientId)
    return entity ? { entity } : null
  }

  @Get('/policies')
  async getPolicies(@Query('clientId') clientId: string): Promise<{ policy: PolicyStore } | null> {
    const policy = await this.policyDataStoreService.getPolicies(clientId)
    return policy ? { policy } : null
  }

  @Post('/entities')
  setEntities(@Query('clientId') clientId: string, @Body() payload: { signature: JwtString; data: Entities }) {
    return this.entityDataStoreService.setEntities(clientId, payload)
  }

  @Post('/policies')
  setPolicies(@Query('clientId') clientId: string, @Body() payload: { signature: JwtString; data: Policy[] }) {
    return this.policyDataStoreService.setPolicies(clientId, payload)
  }
}
