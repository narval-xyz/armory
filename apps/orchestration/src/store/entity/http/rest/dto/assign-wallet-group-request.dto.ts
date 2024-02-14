import { Action, BaseActionDto, BaseActionRequestDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsEnum, ValidateNested } from 'class-validator'
import { WalletGroupMembershipDto } from './wallet-group-membership.dto'

class AssignWalletGroupActionDto extends BaseActionDto {
  @IsEnum(Action)
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.ASSIGN_WALLET_GROUP
  })
  action: typeof Action.ASSIGN_WALLET_GROUP

  @IsDefined()
  @Type(() => WalletGroupMembershipDto)
  @ValidateNested()
  @ApiProperty({
    type: WalletGroupMembershipDto
  })
  data: WalletGroupMembershipDto
}

export class AssignWalletGroupRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @Type(() => AssignWalletGroupActionDto)
  @ValidateNested()
  @ApiProperty({
    type: AssignWalletGroupActionDto
  })
  request: AssignWalletGroupActionDto
}
