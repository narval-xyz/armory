import { Action, AuthCredentialDto, BaseActionDto, BaseAdminRequestPayloadDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, ValidateNested } from 'class-validator'

class CreateCredentialActionDto extends BaseActionDto {
  @IsIn(Object.values(Action))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.CREATE_CREDENTIAL
  })
  action: typeof Action.CREATE_CREDENTIAL

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  credential: AuthCredentialDto
}

export class CreateCredentialRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  request: CreateCredentialActionDto
}
