import { Action, BaseActionDto, BaseAdminRequestPayloadDto, UserWallet } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, ValidateNested } from 'class-validator'

class AssignUserWalletActionDto extends BaseActionDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.ASSIGN_USER_WALLET
  })
  action: typeof Action.ASSIGN_USER_WALLET

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  data: UserWallet
}

export class AssignUserWalletRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  request: AssignUserWalletActionDto
}
