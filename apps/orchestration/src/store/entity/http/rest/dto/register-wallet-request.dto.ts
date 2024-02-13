import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsEnum, ValidateNested } from 'class-validator'
import { BaseActionDto } from './base-action.dto'
import { BaseAdminRequestPayloadDto } from './base-admin-request-payload.dto'
import { WalletDto } from './wallet-dto'

class RegisterWalletActionDto extends BaseActionDto {
  @IsEnum(Action)
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.REGISTER_WALLET
  })
  action: typeof Action.REGISTER_WALLET

  @IsDefined()
  @Type(() => WalletDto)
  @ValidateNested()
  @ApiProperty({
    type: WalletDto
  })
  wallet: WalletDto
}

export class RegisterWalletRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @Type(() => RegisterWalletActionDto)
  @ValidateNested()
  @ApiProperty({
    type: RegisterWalletActionDto
  })
  request: RegisterWalletActionDto
}
