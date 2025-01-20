import { ApiClientIdHeader } from '@narval/nestjs-shared'
import { Controller, Get, HttpStatus, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { AssetService } from '../../../core/service/asset.service'
import { Provider } from '../../../core/type/provider.type'
import { AssetDto } from '../dto/response/asset.dto'

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
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The assets were successfully retrieved.',
    type: AssetDto
  })
  async list(@Query('provider') provider?: Provider): Promise<AssetDto> {
    const data = await this.assetService.findAll({
      filters: { provider }
    })

    return AssetDto.create({ data })
  }
}
