import { AuthCredentialDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'

export class CreateCredentialResponseDto {
  @IsDefined()
  @ValidateNested()
  @ApiProperty()
  credential: AuthCredentialDto

  constructor(partial: Partial<CreateCredentialResponseDto>) {
    Object.assign(this, partial)
  }
}
