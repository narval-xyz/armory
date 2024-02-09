import { Action, BaseActionDto, BaseAdminRequestPayloadDto, WalletGroupMembership } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, ValidateNested } from 'class-validator'

class AssignWalletGroupActionDto extends BaseActionDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.ASSIGN_WALLET_GROUP
  })
  action: typeof Action.ASSIGN_WALLET_GROUP

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  data: WalletGroupMembership
}

export class AssignWalletGroupRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  request: AssignWalletGroupActionDto
}
