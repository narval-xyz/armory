import { ApiClientIdHeader, Paginated } from '@narval/nestjs-shared'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { NetworkService } from '../../../core/service/network.service'
import { Provider } from '../../../core/type/provider.type'
import { PaginatedNetworksDto } from '../dto/response/paginated-networks.dto'

@Controller({
  path: 'networks',
  version: '1'
})
@ApiClientIdHeader()
@ApiTags('Provider Network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get()
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'Retrieve all networks',
    description: 'This endpoint retrieves a list of all available networks.'
  })
  @Paginated({
    type: PaginatedNetworksDto,
    description: 'The networks were successfully retrieved.'
  })
  async list(@Query('provider') provider: Provider): Promise<PaginatedNetworksDto> {
    const data = await this.networkService.findAll({ filters: { provider } })

    return PaginatedNetworksDto.create({ data })
  }
}
