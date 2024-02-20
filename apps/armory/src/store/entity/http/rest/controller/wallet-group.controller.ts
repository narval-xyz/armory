import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { REQUEST_HEADER_ORG_ID } from '../../../../../armory.constant'
import { OrgId } from '../../../../../shared/decorator/org-id.decorator'
import { WalletService } from '../../../core/service/wallet.service'
import { API_PREFIX, API_TAG } from '../../../entity-store.constant'
import { AssignWalletGroupRequestDto } from '../dto/assign-wallet-group-request.dto'
import { AssignWalletGroupResponseDto } from '../dto/assign-wallet-group-response.dto'

@Controller(`${API_PREFIX}/wallet-groups`)
@ApiTags(API_TAG)
export class WalletGroupController {
  constructor(private walletService: WalletService) {}

  @Post()
  @ApiOperation({
    summary: "Assigns a wallet to a group. If the group doesn't exist, creates it first"
  })
  @ApiHeader({
    name: REQUEST_HEADER_ORG_ID
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: AssignWalletGroupResponseDto
  })
  async assign(
    @OrgId() orgId: string,
    @Body() body: AssignWalletGroupRequestDto
  ): Promise<AssignWalletGroupResponseDto> {
    const membership = await this.walletService.assignGroup(orgId, body)

    return new AssignWalletGroupResponseDto({ data: membership })
  }
}
