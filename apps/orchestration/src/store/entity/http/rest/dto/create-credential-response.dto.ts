import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, ValidateNested } from 'class-validator'
import { AuthCredentialDto } from './auth-credential.dto'

export class CreateCredentialResponseDto {
  @IsDefined()
  @Type(() => AuthCredentialDto)
  @ValidateNested()
  @ApiProperty({
    type: AuthCredentialDto
  })
  credential: AuthCredentialDto

  constructor(partial: Partial<CreateCredentialResponseDto>) {
    Object.assign(this, partial)
  }
}
