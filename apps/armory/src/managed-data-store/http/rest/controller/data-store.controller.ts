import { Criterion, EntityUtil, Then, UserRole } from '@narval/policy-engine-shared'
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClusterService } from '../../../../policy-engine/core/service/cluster.service'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { ClientSecretGuard } from '../../../../shared/guard/client-secret.guard'
import { EntityDataStoreService } from '../../../core/service/entity-data-store.service'
import { PolicyDataStoreService } from '../../../core/service/policy-data-store.service'
import { EntityDataStoreDto } from '../dto/entity-data-store.dto'
import { PolicyDataStoreDto } from '../dto/policy-data-store.dto'
import { SetEntityStoreDto, SetEntityStoreResponseDto } from '../dto/set-entity-store.dto'
import { SetPolicyStoreDto, SetPolicyStoreResponseDto } from '../dto/set-policy-store.dto'

@Controller('/data')
@ApiTags('Managed Data Store')
export class DataStoreController {
  constructor(
    private entityDataStoreService: EntityDataStoreService,
    private policyDataStoreService: PolicyDataStoreService,
    private clusterService: ClusterService
  ) {}

  @Get('/entities')
  @ApiOperation({
    summary: 'Gets the client entities'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: EntityDataStoreDto
  })
  async getEntities(@Query('clientId') clientId: string): Promise<EntityDataStoreDto> {
    const entity = await this.entityDataStoreService.getEntities(clientId)

    if (entity) {
      return { entity }
    }

    return {
      entity: {
        data: EntityUtil.empty(),
        signature: ''
      }
    }
  }

  @Get('/policies')
  @ApiOperation({
    summary: 'Gets the client policies'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PolicyDataStoreDto
  })
  async getPolicies(@Query('clientId') clientId: string): Promise<PolicyDataStoreDto> {
    const policy = await this.policyDataStoreService.getPolicies(clientId)

    if (policy) {
      return { policy }
    }

    return {
      policy: {
        data: [
          {
            id: 'admins-full-access',
            description: 'Admins get full access',
            when: [
              {
                criterion: Criterion.CHECK_PRINCIPAL_ROLE,
                args: [UserRole.ADMIN]
              }
            ],
            then: Then.PERMIT
          }
        ],
        signature: ''
      }
    }
  }

  @Post('/entities')
  @ApiOperation({
    summary: 'Sets the client entities'
  })
  @ApiResponse({
    description: 'The client entities have been successfully set',
    status: HttpStatus.CREATED,
    type: SetEntityStoreResponseDto
  })
  setEntities(@Query('clientId') clientId: string, @Body() body: { entity: SetEntityStoreDto }) {
    return this.entityDataStoreService.setEntities(clientId, body.entity)
  }

  @Post('/policies')
  @ApiOperation({
    summary: 'Sets the client policies'
  })
  @ApiResponse({
    description: 'The client policies have been successfully set',
    status: HttpStatus.CREATED,
    type: SetPolicyStoreResponseDto
  })
  setPolicies(@Query('clientId') clientId: string, @Body() body: { policy: SetPolicyStoreDto }) {
    return this.policyDataStoreService.setPolicies(clientId, body.policy)
  }

  @Post('/sync')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClientSecretGuard)
  @ApiOperation({
    summary: 'Sync the client data store with the engine cluster'
  })
  @ApiResponse({
    description: 'The client data store has been successfully synced',
    status: HttpStatus.OK
  })
  async sync(@ClientId('clientId') clientId: string) {
    try {
      const success = await this.clusterService.sync(clientId)

      return {
        latestSync: {
          success
        }
      }
    } catch (error) {
      return {
        latestSync: {
          success: false
        }
      }
    }
  }
}
