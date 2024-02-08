import { AuthCredential } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'
import { AuthCredentialDto } from './auth-credential.dto'

export class CreateCredentialResponseDto {
  constructor(authCredential: AuthCredential) {
    this.credential = new AuthCredentialDto(authCredential)
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  credential: AuthCredentialDto
}
