import { Permission } from '@narval/armory-sdk'
import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiHeader, ApiSecurity } from '@nestjs/swagger'
import { REQUEST_HEADER_AUTHORIZATION, REQUEST_HEADER_CLIENT_ID } from '../../../../main.constant'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { Permissions } from '../../../../shared/decorator/permissions.decorator'
import { AuthorizationGuard } from '../../../../shared/guard/authorization.guard'
import { AdminService } from '../../../core/service/admin.service'
import { GetWalletsDto } from '../dto/get-wallets.dto'

const PERMISSIONS = [Permission.WALLET_READ]

@Controller()
@Permissions(PERMISSIONS)
@UseGuards(AuthorizationGuard)
@ApiSecurity('GNAP', PERMISSIONS)
@ApiHeader({
  name: REQUEST_HEADER_CLIENT_ID
})
@ApiHeader({
  name: REQUEST_HEADER_AUTHORIZATION
})
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('/wallets')
  async getWallets(@ClientId() clientId: string) {
    const wallets = await this.adminService.getWallets(clientId)

    return GetWalletsDto.create({ wallets })
  }
}
