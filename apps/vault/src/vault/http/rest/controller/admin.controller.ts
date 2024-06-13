import { Permission } from '@narval/armory-sdk'
import { Controller, Get, HttpStatus } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { REQUEST_HEADER_CLIENT_ID } from '../../../../main.constant'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { PermissionGuard } from '../../../../shared/decorator/permission-guard.decorator'
import { AdminService } from '../../../core/service/admin.service'
import { AccountsDto } from '../dto/accounts.dto'

@Controller()
@PermissionGuard(Permission.WALLET_READ)
@ApiHeader({
  name: REQUEST_HEADER_CLIENT_ID,
  required: true
})
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('/accounts')
  @ApiOperation({
    summary: 'Lists the client accounts'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AccountsDto
  })
  async getAccounts(@ClientId() clientId: string): Promise<AccountsDto> {
    const accounts = await this.adminService.getAccounts(clientId)

    return AccountsDto.create({ accounts })
  }
}
