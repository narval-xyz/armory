import { Action, BaseActionDto, BaseActionRequestDto } from '@narval/policy-engine-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, Matches, ValidateNested } from 'class-validator'
import { UserWalletDto } from './user-wallet.dto'

class AssignUserWalletActionDto extends BaseActionDto {
  @Matches(Action.ASSIGN_USER_WALLET)
  @ApiProperty({
    enum: [Action.ASSIGN_USER_WALLET],
    default: Action.ASSIGN_USER_WALLET
  })
  action: typeof Action.ASSIGN_USER_WALLET

  @IsDefined()
  @Type(() => UserWalletDto)
  @ValidateNested()
  @ApiProperty()
  data: UserWalletDto
}

export class AssignUserWalletRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @Type(() => AssignUserWalletActionDto)
  @ValidateNested()
  @ApiProperty()
  request: AssignUserWalletActionDto
}
