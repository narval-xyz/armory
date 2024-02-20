import { Action, BaseActionDto, BaseActionRequestDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, Matches, ValidateNested } from 'class-validator'
import { WalletGroupMembershipDto } from './wallet-group-membership.dto'

class AssignWalletGroupActionDto extends BaseActionDto {
  @Matches(Action.ASSIGN_WALLET_GROUP)
  @ApiProperty({
    enum: [Action.ASSIGN_WALLET_GROUP],
    default: Action.ASSIGN_WALLET_GROUP
  })
  action: typeof Action.ASSIGN_WALLET_GROUP

  @IsDefined()
  @Type(() => WalletGroupMembershipDto)
  @ValidateNested()
  @ApiProperty()
  data: WalletGroupMembershipDto
}

export class AssignWalletGroupRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @Type(() => AssignWalletGroupActionDto)
  @ValidateNested()
  @ApiProperty()
  request: AssignWalletGroupActionDto
}
