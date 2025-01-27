import { ApiClientIdHeader, Paginated } from '@narval/nestjs-shared'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { KnownDestinationService } from '../../../core/service/known-destination.service'
import { REQUEST_HEADER_CONNECTION_ID } from '../../../shared/constant'
import { ConnectionId } from '../../../shared/decorator/connection-id.decorator'
import { PaginatedKnownDestinationsDto } from '../dto/response/paginated-known-destinations.dto'

@Controller({
  path: 'known-destinations',
  version: '1'
})
@ApiTags('Provider Known Destination')
@ApiClientIdHeader()
export class KnownDestinationController {
  constructor(private readonly knownDestinationService: KnownDestinationService) {}

  @Get()
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({ summary: 'Get known destinations across providers' })
  @ApiHeader({
    name: REQUEST_HEADER_CONNECTION_ID,
    description: 'The provider connection through which the resource is accessed'
  })
  @Paginated({
    type: PaginatedKnownDestinationsDto,
    description: 'Returns a paginated list of known-destinations for the client'
  })
  async list(
    @ClientId() clientId: string,
    @ConnectionId() connectionId: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string
  ): Promise<PaginatedKnownDestinationsDto> {
    const { data, page } = await this.knownDestinationService.findAll(
      {
        clientId,
        connectionId
      },
      {
        limit,
        cursor
      }
    )

    return PaginatedKnownDestinationsDto.create({ data, page })
  }
}
