import { Action, BaseActionDto, BaseActionRequestDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, Matches, ValidateNested } from 'class-validator'
import { WalletDto } from './wallet.dto'

class RegisterWalletActionDto extends BaseActionDto {
  @Matches(Action.REGISTER_WALLET)
  @ApiProperty({
    enum: [Action.REGISTER_WALLET],
    default: Action.REGISTER_WALLET
  })
  action: typeof Action.REGISTER_WALLET

  @IsDefined()
  @Type(() => WalletDto)
  @ValidateNested()
  @ApiProperty()
  wallet: WalletDto
}

export class RegisterWalletRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @Type(() => RegisterWalletActionDto)
  @ValidateNested()
  @ApiProperty()
  request: RegisterWalletActionDto
}
