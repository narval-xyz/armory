import { Action, BaseActionDto, BaseAdminRequestPayloadDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, ValidateNested } from 'class-validator'
import { WalletDataDto } from './wallet-dto'

class RegisterWalletActionDto extends BaseActionDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.REGISTER_WALLET
  })
  action: typeof Action.REGISTER_WALLET

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  wallet: WalletDataDto
}

export class RegisterWalletRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  request: RegisterWalletActionDto
}
