import { Action, BaseActionDto, BaseActionRequestDto } from '@narval/policy-engine-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, Matches, ValidateNested } from 'class-validator'
import { AuthCredentialDto } from './auth-credential.dto'

class CreateCredentialActionDto extends BaseActionDto {
  @Matches(Action.CREATE_CREDENTIAL)
  @ApiProperty({
    enum: [Action.CREATE_CREDENTIAL],
    default: Action.CREATE_CREDENTIAL
  })
  action: typeof Action.CREATE_CREDENTIAL

  @IsDefined()
  @Type(() => AuthCredentialDto)
  @ValidateNested()
  @ApiProperty()
  credential: AuthCredentialDto
}

export class CreateCredentialRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @Type(() => CreateCredentialActionDto)
  @ValidateNested()
  @ApiProperty()
  request: CreateCredentialActionDto
}
