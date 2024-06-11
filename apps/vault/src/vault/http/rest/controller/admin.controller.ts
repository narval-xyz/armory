import { Permission } from '@narval/armory-sdk'
import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiSecurity } from '@nestjs/swagger'
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
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('/wallets')
  async getWallets(@ClientId() clientId: string) {
    const wallets = await this.adminService.getWallets(clientId)

    return GetWalletsDto.create({ wallets })
  }
}
