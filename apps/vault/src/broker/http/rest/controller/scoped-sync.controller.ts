import { ApiClientIdHeader, Paginated, PaginationOptions, PaginationParam } from '@narval/nestjs-shared'
import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { ConnectionService } from '../../../core/service/connection.service'
import { ScopedSyncService } from '../../../core/service/scoped-sync.service'
import { REQUEST_HEADER_CONNECTION_ID } from '../../../shared/constant'
import { ConnectionId } from '../../../shared/decorator/connection-id.decorator'
import { StartScopedSyncDto } from '../dto/request/start-scoped-sync.dto'
import { PaginatedScopedSyncsDto } from '../dto/response/paginated-scoped-syncs.dto'
import { ScopedSyncStartedDto } from '../dto/response/scoped-sync-started.dto'
import { ScopedSyncDto } from '../dto/response/scoped-sync.dto'

@Controller({
  path: 'scoped-syncs',
  version: '1'
})
@ApiClientIdHeader()
@ApiTags('Provider Scoped Sync')
export class ScopedSyncController {
  constructor(
    private readonly scopedSyncService: ScopedSyncService,
    private readonly connectionService: ConnectionService
  ) {}

  @Post()
  // ScopedSync is a read operation even though it's a POST.
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'Start a scoped synchronization process',
    description: 'This endpoint starts scoped synchronization process for the client.'
  })
  @ApiResponse({
    description: 'Returns the status of the scoped synchronization process.',
    status: HttpStatus.CREATED,
    type: ScopedSyncStartedDto
  })
  async start(@ClientId() clientId: string, @Body() body: StartScopedSyncDto): Promise<ScopedSyncStartedDto> {
    const connection = await this.connectionService.findWithCredentialsById(clientId, body.connectionId)
    const data = await this.scopedSyncService.start([connection], body.rawAccounts)

    return ScopedSyncStartedDto.create({ data })
  }

  @Get(':scopedSyncId')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'Retrieve a specific scoped synchronization process by ID',
    description:
      'This endpoint retrieves the details of a specific scoped synchronization process associated with the client, identified by the scoped sync ID.'
  })
  @ApiHeader({
    name: REQUEST_HEADER_CONNECTION_ID,
    description: 'The provider connection through which the resource is accessed'
  })
  @ApiResponse({
    description: 'Returns the details of the specified synchronization process.',
    status: HttpStatus.OK,
    type: ScopedSyncDto
  })
  async getById(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @Param('scopedSyncId') scopedSyncId: string
  ): Promise<ScopedSyncDto> {
    const data = await this.scopedSyncService.findById({ clientId, connectionId }, scopedSyncId)

    return ScopedSyncDto.create({ data })
  }

  @Get()
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'Retrieve a list of synchronization processes',
    description:
      'This endpoint retrieves a list of synchronization processes associated with the client. Optionally, it can filter the processes by a specific connection ID.'
  })
  @ApiHeader({
    name: REQUEST_HEADER_CONNECTION_ID,
    description: 'The provider connection through which the resource is accessed'
  })
  @Paginated({
    type: PaginatedScopedSyncsDto,
    description: 'Returns a paginated list of accounts associated with the connection'
  })
  async list(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @PaginationParam() pagination: PaginationOptions
  ): Promise<PaginatedScopedSyncsDto> {
    return PaginatedScopedSyncsDto.create(
      await this.scopedSyncService.findAll(
        {
          clientId,
          connectionId
        },
        {
          pagination
        }
      )
    )
  }
}
