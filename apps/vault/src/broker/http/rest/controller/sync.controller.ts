import { ApiClientIdHeader, Paginated, PaginationOptions, PaginationParam } from '@narval/nestjs-shared'
import { Controller, Get } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { SyncService } from '../../../core/service/sync.service'
import { REQUEST_HEADER_CONNECTION_ID } from '../../../shared/constant'
import { ConnectionId } from '../../../shared/decorator/connection-id.decorator'
import { PaginatedSyncsDto } from '../dto/response/paginated-syncs.dto'

@Controller({
  path: 'syncs',
  version: '1'
})
@ApiClientIdHeader()
@ApiTags('Provider Sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}
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
    type: PaginatedSyncsDto,
    description: 'Returns a paginated list of accounts associated with the connection'
  })
  async list(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @PaginationParam() pagination: PaginationOptions
  ): Promise<PaginatedSyncsDto> {
    return PaginatedSyncsDto.create(
      await this.syncService.findAll(
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
