import { ApiClientIdHeader } from '@narval/nestjs-shared'
import { Controller, Get, HttpStatus, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { VaultPermission } from '../../../../shared/type/domain.type'
import { Provider } from '../../../core/type/provider.type'
import { NetworkRepository } from '../../../persistence/repository/network.repository'
import { NetworkDto } from '../dto/response/network.dto'

@Controller({
  path: 'networks',
  version: '1'
})
@ApiClientIdHeader()
@ApiTags('Provider Network')
export class NetworkController {
  constructor(private readonly networkRepository: NetworkRepository) {}

  @Get()
  @PermissionGuard(VaultPermission.CONNECTION_READ)
  @ApiOperation({
    summary: 'Retrieve all networks',
    description: 'This endpoint retrieves a list of all available networks.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The networks were successfully retrieved.',
    type: NetworkDto
  })
  async list(@Query('provider') provider: Provider): Promise<NetworkDto> {
    const networks = await this.networkRepository.findAll({
      filters: { provider }
    })

    return NetworkDto.create({ data: networks })
  }
}
