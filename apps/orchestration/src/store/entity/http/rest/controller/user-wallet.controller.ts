import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { REQUEST_HEADER_ORG_ID } from '../../../../../orchestration.constant'
import { OrgId } from '../../../../../shared/decorator/org-id.decorator'
import { UserService } from '../../../core/service/user.service'
import { AssignUserWalletRequestDto } from '../dto/assign-user-wallet-request.dto'
import { AssignUserWalletResponseDto } from '../dto/assign-user-wallet-response.dto'

@Controller('/store/user-wallets')
@ApiTags('Entity Store')
export class UserWalletController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Assigns a wallet to a user.'
  })
  @ApiHeader({
    name: REQUEST_HEADER_ORG_ID
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AssignUserWalletResponseDto
  })
  async assign(@OrgId() orgId: string, @Body() body: AssignUserWalletRequestDto) {
    const { data } = body.request

    await this.userService.assignWallet(body.request.data)

    return new AssignUserWalletResponseDto({ data })
  }
}
