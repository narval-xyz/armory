import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, ValidateNested } from 'class-validator'
import { WalletDto } from './wallet.dto'

export class RegisterWalletResponseDto {
  @IsDefined()
  @Type(() => WalletDto)
  @ValidateNested()
  @ApiProperty()
  wallet: WalletDto

  constructor(partial: Partial<RegisterWalletResponseDto>) {
    Object.assign(this, partial)
  }
}
