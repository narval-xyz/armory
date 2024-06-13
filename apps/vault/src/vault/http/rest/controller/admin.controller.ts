import { Permission } from '@narval/armory-sdk'
import { Controller, Get, HttpStatus } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { REQUEST_HEADER_CLIENT_ID } from '../../../../main.constant'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { AdminService } from '../../../core/service/admin.service'
import { WalletsDto } from '../dto/_OLD_WALLETS_.dto'

@Controller()
@PermissionGuard(Permission.WALLET_READ)
@ApiHeader({
  name: REQUEST_HEADER_CLIENT_ID,
  required: true
})
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('/_OLD_WALLETS_')
  @ApiOperation({
    summary: 'Lists the client _OLD_WALLETS_'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: WalletsDto
  })
  async getWallets(@ClientId() clientId: string): Promise<WalletsDto> {
    const _OLD_WALLETS_ = await this.adminService.getWallets(clientId)

    return WalletsDto.create({ _OLD_WALLETS_ })
  }
}
