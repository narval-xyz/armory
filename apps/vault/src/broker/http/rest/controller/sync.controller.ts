import { Paginated, PaginationOptions, PaginationParam } from '@narval/nestjs-shared'
import { Body, Controller, Get, HttpStatus, Param, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { SyncService } from '../../../core/service/sync.service'
import { StartSyncDto } from '../dto/request/start-sync.dto'
import { PaginatedSyncsDto } from '../dto/response/paginated-syncs.dto'
import { SyncStatusDto } from '../dto/response/sync-status.dto'
import { SyncDto } from '../dto/response/sync.dto'

@Controller({
  path: 'syncs',
  version: '1'
})
@ApiTags('Provider Sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  @ApiOperation({
    summary: 'Start a synchronization process',
    description: 'This endpoint starts synchronization process for the client.'
  })
  @ApiResponse({
    description: 'Returns the status of the synchronization process.',
    status: HttpStatus.CREATED,
    type: SyncStatusDto
  })
  async start(@ClientId() clientId: string, @Body() body: StartSyncDto): Promise<SyncStatusDto> {
    return SyncStatusDto.create(await this.syncService.start({ clientId, ...body }))
  }

  @Get(':syncId')
  @ApiOperation({
    summary: 'Retrieve a specific synchronization process by ID',
    description:
      'This endpoint retrieves the details of a specific synchronization process associated with the client, identified by the sync ID.'
  })
  @ApiResponse({
    description: 'Returns the details of the specified synchronization process.',
    status: HttpStatus.OK,
    type: SyncDto
  })
  async findById(@ClientId() clientId: string, @Param('syncId') syncId: string): Promise<SyncDto> {
    const sync = await this.syncService.findById(clientId, syncId)

    return SyncDto.create(sync)
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve a list of synchronization processes',
    description:
      'This endpoint retrieves a list of synchronization processes associated with the client. Optionally, it can filter the processes by a specific connection ID.'
  })
  @Paginated({
    type: PaginatedSyncsDto,
    description: 'Returns a paginated list of accounts associated with the connection'
  })
  async findAll(
    @ClientId() clientId: string,
    @PaginationParam() options: PaginationOptions,
    @Query('connectionId') connectionId?: string
  ): Promise<PaginatedSyncsDto> {
    const { data, page } = await this.syncService.findAllPaginated(clientId, {
      ...options,
      filters: { connectionId }
    })

    return PaginatedSyncsDto.create({ syncs: data, page: page })
  }
}
