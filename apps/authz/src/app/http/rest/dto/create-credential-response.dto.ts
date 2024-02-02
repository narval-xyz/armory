import { AuthCredentialDto } from '@app/authz/app/http/rest/dto/auth-credential.dto'
import { AuthCredential } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'

export class CreateCredentialResponseDto {
  constructor(authCredential: AuthCredential) {
    this.credential = new AuthCredentialDto(authCredential)
  }

  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  credential: AuthCredentialDto
}
