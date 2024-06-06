import { Permission } from '@narval/armory-sdk'
import {
  SignMessageAction,
  SignRawAction,
  SignTransactionAction,
  SignTypedDataAction
} from '@narval/policy-engine-shared'
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { Permissions } from '../../../../shared/decorator/permissions.decorator'
import { AuthorizationGuard } from '../../../../shared/guard/authorization.guard'
import { NonceGuard } from '../../../../shared/guard/nonce.guard'
import { WalletService } from '../../../core/service/wallet.service'
import { GetWalletsDto } from '../dto/get-wallets.dto'

const SignRequest = z.object({
  request: z.union([SignTransactionAction, SignMessageAction, SignTypedDataAction, SignRawAction])
})

class SignRequestDto extends createZodDto(SignRequest) {}

@Controller('/wallets')
@UseGuards(AuthorizationGuard)
@Permissions([Permission.WALLET_READ])
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  async getWallets(@ClientId() clientId: string) {
    const wallets = await this.walletService.findAll(clientId)
    const publicWallets = GetWalletsDto.create({ wallets })
    return publicWallets
  }

  @UseGuards(AuthorizationGuard, NonceGuard)
  @Permissions([])
  @Post('/sign')
  async sign(@ClientId() clientId: string, @Body() body: SignRequestDto) {
    const parsed = SignRequest.parse(body)
    const { request } = parsed
    const result = await this.walletService.sign(clientId, request)

    return { signature: result }
  }
}
