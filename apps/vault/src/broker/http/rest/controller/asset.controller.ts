import { ApiClientIdHeader, Paginated } from '@narval/nestjs-shared'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { AssetService } from '../../../core/service/asset.service'
import { Provider } from '../../../core/type/provider.type'
import { PaginatedAssetsDto } from '../dto/response/paginated-assets.dto'

@Controller({
  path: 'assets',
  version: '1'
})
@ApiClientIdHeader()
@ApiTags('Provider Asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'Retrieve all assets',
    description: 'This endpoint retrieves a list of all available assets.'
  })
  @Paginated({
    type: PaginatedAssetsDto,
    description: 'The assets were successfully retrieved.'
  })
  async list(@Query('provider') provider?: Provider): Promise<PaginatedAssetsDto> {
    const data = await this.assetService.findAll({
      filters: { provider }
    })

    return PaginatedAssetsDto.create({ data })
  }
}
