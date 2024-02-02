import { BaseActionDto } from '@app/authz/app/http/rest/dto/base-action.dto'
import { BaseAdminRequestPayloadDto } from '@app/authz/app/http/rest/dto/base-admin-request-payload.dto'
import { WalletDataDto } from '@app/authz/app/http/rest/dto/wallet-dto'
import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, ValidateNested } from 'class-validator'

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
