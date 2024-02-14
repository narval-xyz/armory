import { Action, BaseActionDto, BaseActionRequestDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsEnum, ValidateNested } from 'class-validator'
import { AuthCredentialDto } from './auth-credential.dto'

class CreateCredentialActionDto extends BaseActionDto {
  @IsEnum(Action)
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

export class CreateCredentialRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @Type(() => CreateCredentialActionDto)
  @ValidateNested()
  @ApiProperty({
    type: CreateCredentialActionDto
  })
  request: CreateCredentialActionDto
}
