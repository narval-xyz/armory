import { Action } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsEnum, ValidateNested } from 'class-validator'
import { AuthCredentialDto } from './auth-credential.dto'
import { BaseActionDto } from './base-action.dto'
import { BaseAdminRequestPayloadDto } from './base-admin-request-payload.dto'

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

export class CreateCredentialRequestDto extends BaseAdminRequestPayloadDto {
  @IsDefined()
  @Type(() => CreateCredentialActionDto)
  @ValidateNested()
  @ApiProperty({
    type: CreateCredentialActionDto
  })
  request: CreateCredentialActionDto
}
