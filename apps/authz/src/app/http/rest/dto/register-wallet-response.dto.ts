import { WalletDataDto } from '@app/authz/app/http/rest/dto/wallet-dto'
import { Wallet } from '@app/authz/shared/types/entities.types'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'

export class RegisterWalletResponseDto {
  constructor(wallet: Wallet) {
    this.wallet = new WalletDataDto(wallet)
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  wallet: WalletDataDto
}
