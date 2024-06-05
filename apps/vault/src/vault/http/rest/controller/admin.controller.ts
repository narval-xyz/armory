import { Permission } from '@narval-xyz/armory-sdk'
import { Controller, Get, UseGuards } from '@nestjs/common'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { Permissions } from '../../../../shared/decorator/permissions.decorator'
import { AuthorizationGuard } from '../../../../shared/guard/authorization.guard'
import { AdminService } from '../../../core/service/admin.service'
import { GetWalletsDto } from '../dto/get-wallets.dto'

@Controller()
@Permissions([Permission.WALLET_READ])
@UseGuards(AuthorizationGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('/wallets')
  async getWallets(@ClientId() clientId: string) {
    const wallets = await this.adminService.getWallets(clientId)
    const publicWallets = GetWalletsDto.create({ wallets })
    return publicWallets
  }
}
