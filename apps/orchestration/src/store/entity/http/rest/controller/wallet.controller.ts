import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { REQUEST_HEADER_ORG_ID } from '../../../../../orchestration.constant'
import { OrgId } from '../../../../../shared/decorator/org-id.decorator'
import { WalletService } from '../../../core/service/wallet.service'
import { API_PREFIX, API_TAG } from '../../../entity-store.constant'
import { RegisterWalletRequestDto } from '../dto/register-wallet-request.dto'
import { RegisterWalletResponseDto } from '../dto/register-wallet-response.dto'

@Controller(`${API_PREFIX}/wallets`)
@ApiTags(API_TAG)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post()
  @ApiOperation({
    summary: 'Registers wallet as an entity.'
  })
  @ApiHeader({
    name: REQUEST_HEADER_ORG_ID
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RegisterWalletResponseDto
  })
  async register(@OrgId() orgId: string, @Body() body: RegisterWalletRequestDto): Promise<RegisterWalletResponseDto> {
    const wallet = await this.walletService.create(orgId, body.request.wallet)

    return new RegisterWalletResponseDto({ wallet })
  }
}
