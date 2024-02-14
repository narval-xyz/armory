import { Action, BaseActionDto, BaseActionRequestDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsEnum, ValidateNested } from 'class-validator'
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

export class AssignUserWalletRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @Type(() => AssignUserWalletActionDto)
  @ValidateNested()
  @ApiProperty({
    type: AssignUserWalletActionDto
  })
  request: AssignUserWalletActionDto
}
