import { Action, BaseAdminRequestPayloadDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsEnum, ValidateNested } from 'class-validator'
import { BaseActionDto } from './base-action.dto'
import { UserWalletDto } from './user-wallet.dto'

class AssignUserWalletActionDto extends BaseActionDto {
  @IsEnum(Object.values(Action))
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.ASSIGN_USER_WALLET
  })
  action: typeof Action.ASSIGN_USER_WALLET

  @IsDefined()
  @Type(() => UserWalletDto)
  @ValidateNested()
  @ApiProperty({
    type: UserWalletDto
  })
  data: UserWalletDto
}

export class AssignUserWalletRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @Type(() => AssignUserWalletActionDto)
  @ValidateNested()
  @ApiProperty({
    type: AssignUserWalletActionDto
  })
  request: AssignUserWalletActionDto
}
