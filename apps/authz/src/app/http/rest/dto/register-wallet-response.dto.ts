import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'
import { Wallet } from '../../../../shared/types/entities.types'
import { WalletDataDto } from './wallet-dto'

export class RegisterWalletResponseDto {
  constructor(wallet: Wallet) {
    this.wallet = new WalletDataDto(wallet)
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  wallet: WalletDataDto
}
