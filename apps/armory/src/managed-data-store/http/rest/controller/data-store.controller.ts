import { MetricService, TraceService } from '@narval/nestjs-shared'
import { Criterion, EntityUtil, Then, UserRole } from '@narval/policy-engine-shared'
import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClusterService } from '../../../../policy-engine/core/service/cluster.service'
import { ApiClientSecretGuard } from '../../../../shared/decorator/api-client-secret-guard.decorator'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { EntityDataStoreService } from '../../../core/service/entity-data-store.service'
import { PolicyDataStoreService } from '../../../core/service/policy-data-store.service'
import { DataStoreGuard } from '../../../shared/guard/data-store.guard'
import { EntityDataStoreDto } from '../dto/entity-data-store.dto'
import { PolicyDataStoreDto } from '../dto/policy-data-store.dto'
import { SetEntityStoreDto, SetEntityStoreResponseDto } from '../dto/set-entity-store.dto'
import { SetPolicyStoreDto, SetPolicyStoreResponseDto } from '../dto/set-policy-store.dto'
import { SyncDto } from '../dto/sync.dto'

@Controller({
  path: '/data',
  version: '1'
})
@ApiTags('Managed Data Store')
export class DataStoreController {
  constructor(
    private entityDataStoreService: EntityDataStoreService,
    private policyDataStoreService: PolicyDataStoreService,
    private clusterService: ClusterService,
    @Inject(TraceService) private traceService: TraceService,
    @Inject(MetricService) private metricService: MetricService
  ) {}

  @Get('/entities')
  @UseGuards(DataStoreGuard)
  @ApiOperation({
    summary: 'Gets the client entities'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: EntityDataStoreDto
  })
  async getEntities(@Query('clientId') clientId: string): Promise<EntityDataStoreDto> {
    this.metricService.createCounter('data_store_entity_get_count').add(1, { clientId })

    return this.traceService.startActiveSpan('dataStore.entity.get', async (span) => {
      span.setAttributes({ clientId })

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
    })
  }

  @Get('/policies')
  @UseGuards(DataStoreGuard)
  @ApiOperation({
    summary: 'Gets the client policies'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PolicyDataStoreDto
  })
  async getPolicies(@Query('clientId') clientId: string): Promise<PolicyDataStoreDto> {
    this.metricService.createCounter('data_store_policy_get_count').add(1, { clientId })

    return this.traceService.startActiveSpan('dataStore.policy.get', async (span) => {
      span.setAttributes({ clientId })

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
    })
  }

  @Post('/entities')
  @ApiOperation({
    summary: 'Sets the client entities'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SetEntityStoreResponseDto
  })
  setEntities(@Query('clientId') clientId: string, @Body() body: SetEntityStoreDto) {
    this.metricService.createCounter('data_store_entity_set_count').add(1, { clientId })

    return this.traceService.startActiveSpan('dataStore.entity.set', (span) => {
      span.setAttributes({ clientId })

      return this.entityDataStoreService.setEntities(clientId, body)
    })
  }

  @Post('/policies')
  @ApiOperation({
    summary: 'Sets the client policies'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: SetPolicyStoreResponseDto
  })
  setPolicies(
    @Query('clientId') clientId: string,
    @Body() body: SetPolicyStoreDto
  ): Promise<SetPolicyStoreResponseDto> {
    this.metricService.createCounter('data_store_policy_set_count').add(1, { clientId })

    return this.traceService.startActiveSpan('dataStore.policy.set', (span) => {
      span.setAttributes({ clientId })

      return this.policyDataStoreService.setPolicies(clientId, body)
    })
  }

  @Post('/sync')
  @ApiClientSecretGuard()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sync the client data store with the engine cluster'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SyncDto
  })
  async sync(@ClientId('clientId') clientId: string): Promise<SyncDto> {
    this.metricService.createCounter('data_store_cluster_sync_count').add(1, { clientId })

    return this.traceService.startActiveSpan('dataStore.cluster.sync', async (span) => {
      span.setAttributes({ clientId })

      try {
        const success = await this.clusterService.sync(clientId)

        return {
          latestSync: {
            success
          }
        }
      } catch (error) {
        return SyncDto.create({
          latestSync: {
            success: false
          }
        })
      }
    })
  }
}
