import { Alg } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsString } from 'class-validator'

export class AuthCredentialDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  uid: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  pubKey: string

  @IsEnum(Alg)
  @IsDefined()
  @ApiProperty()
  alg: Alg

  @IsString()
  @IsDefined()
  @ApiProperty()
  userId: string
}
