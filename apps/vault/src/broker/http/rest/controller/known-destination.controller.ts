import { ApiClientIdHeader, Paginated, PaginationOptions, PaginationParam } from '@narval/nestjs-shared'
import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { KnownDestinationService } from '../../../core/service/known-destination.service'
import { PaginatedKnownDestinationsDto } from '../dto/response/paginated-known-destinations.dto'
import { KnownDestinationDto } from '../dto/response/provider-known-destination.dto'

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
  @Paginated({
    type: PaginatedKnownDestinationsDto,
    description: 'Returns a paginated list of known-destinations for the client'
  })
  async list(
    @ClientId() clientId: string,
    @PaginationParam() pagination: PaginationOptions,
    @Query('connectionId') connectionId?: string
  ): Promise<PaginatedKnownDestinationsDto> {
    const filters = connectionId ? { connections: [connectionId] } : {}

    const { data, page } = await this.knownDestinationService.findAll(clientId, {
      filters,
      pagination
    })

    return PaginatedKnownDestinationsDto.create({ data, page })
  }

  @Get(':knownDestinationId')
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({ summary: 'Get known destination by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns known destination',
    type: KnownDestinationDto
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Known destination not found'
  })
  async getById(
    @ClientId() clientId: string,
    @Param('knownDestinationId') knownDestinationId: string
  ): Promise<KnownDestinationDto> {
    const data = await this.knownDestinationService.getKnownDestination(clientId, knownDestinationId)
    return KnownDestinationDto.create({ data })
  }
}
