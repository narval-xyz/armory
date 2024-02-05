import { BaseActionDto } from '@app/authz/app/http/rest/dto/base-action.dto'
import { BaseAdminRequestPayloadDto } from '@app/authz/app/http/rest/dto/base-admin-request-payload.dto'
import { TokenDataDto } from '@app/authz/app/http/rest/dto/register-token-dto'
import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDefined, IsIn, ValidateNested } from 'class-validator'

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
