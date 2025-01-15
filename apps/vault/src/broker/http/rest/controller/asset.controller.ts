import { ApiClientIdHeader } from '@narval/nestjs-shared'
import { BadRequestException, Controller, Get, HttpStatus, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { AnchorageAssetService } from '../../../core/provider/anchorage/anchorage-asset.service'
import { FireblocksAssetService } from '../../../core/provider/fireblocks/fireblocks-asset.service'
import { Asset } from '../../../core/type/asset.type'
import { Provider } from '../../../core/type/provider.type'
import { ProviderAssetDto } from '../dto/response/provider-asset.dto'

@Controller({
  path: 'assets',
  version: '1'
})
@ApiClientIdHeader()
@ApiTags('Provider Asset')
export class AssetController {
  constructor(
    private readonly anchorageAssetService: AnchorageAssetService,
    private readonly fireblocksAssetService: FireblocksAssetService
  ) {}

  @Get()
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'Retrieve all assets',
    description: 'This endpoint retrieves a list of all available assets for a specified provider.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The assets were successfully retrieved.',
    type: ProviderAssetDto
  })
  async list(@Query('provider') provider: Provider): Promise<ProviderAssetDto> {
    const data = await this.findAllByProvider(provider)

    return ProviderAssetDto.create({ data })
  }

  private findAllByProvider(provider: Provider): Promise<Asset[]> {
    switch (provider) {
      case Provider.ANCHORAGE:
        return this.anchorageAssetService.findAll()
      case Provider.FIREBLOCKS:
        return this.fireblocksAssetService.findAll()
      default:
        throw new BadRequestException(`Provider ${provider} not implemented`)
    }
  }
}
