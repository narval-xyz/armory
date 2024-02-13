import { Body, Controller, HttpStatus, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { OrgId } from '../../../../../shared/decorator/org-id.decorator'
import { WalletService } from '../../../core/service/wallet.service'
import { RegisterWalletRequestDto } from '../dto/register-wallet-request.dto'
import { RegisterWalletResponseDto } from '../dto/register-wallet-response.dto'

@Controller('/store/wallets')
@ApiTags('Entity Store')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post()
  @ApiOperation({
    summary: 'Registers wallet as an entity'
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
