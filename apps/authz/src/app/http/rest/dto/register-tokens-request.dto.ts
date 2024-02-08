import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDefined, IsIn, ValidateNested } from 'class-validator'
import { BaseActionDto } from './base-action.dto'
import { BaseAdminRequestPayloadDto } from './base-admin-request-payload.dto'
import { TokenDataDto } from './register-token-dto'

class RegisterTokensActionDto extends BaseActionDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.REGISTER_TOKENS
  })
  action: typeof Action.REGISTER_TOKENS

  @IsDefined()
  @ValidateNested()
  @IsArray()
  @ApiProperty()
  tokens: TokenDataDto[]
}

export class RegisterTokensRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  request: RegisterTokensActionDto
}
